/**
 * Integration tests for HTTP transport with MCP protocol
 *
 * These tests verify the full MCP protocol flow over HTTP including:
 * - Server initialization
 * - Session management
 * - Prompt listing
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HttpTransport } from "../../src/transports/http.js";
import { ServerFactory } from "../../src/server/server-factory.js";
import { PromptManager } from "../../src/prompts/prompt-manager.js";
import type { ServerConfig } from "../../src/config/types.js";

describe("HttpTransport - MCP Protocol Integration", () => {
  let transport: HttpTransport;
  let promptManager: PromptManager;
  let config: ServerConfig;
  const testPort = 3400; // Use a unique port for these tests

  beforeEach(() => {
    // Create fresh instances for each test
    promptManager = new PromptManager();
    config = {
      serverName: "test-mcp-server",
      serverVersion: "1.0.0",
      httpPort: testPort,
      logLevel: "error", // Suppress logs during tests
      enableStdio: false,
      enableHttp: true
    };

    // Add test prompts
    promptManager.register({
      name: "test-prompt-1",
      description: "First test prompt",
      content: "Test content 1",
      tags: ["test"],
      metadata: {
        source: "custom",
        filePath: "/test/test-prompt-1.md",
        loadedAt: new Date()
      }
    });

    promptManager.register({
      name: "test-prompt-2",
      description: "Second test prompt",
      content: "Test content 2",
      tags: ["test"],
      arguments: [
        {
          name: "input",
          description: "Test input",
          required: true
        }
      ],
      metadata: {
        source: "custom",
        filePath: "/test/test-prompt-2.md",
        loadedAt: new Date()
      }
    });

    // Mock process.stderr.write to prevent log output during tests
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(async () => {
    // Clean up any running transport
    if (transport && transport.isRunning()) {
      await transport.stop();
    }
    vi.restoreAllMocks();
  });

  describe("MCP Protocol Flow", () => {
    it("should handle initialize request and return session ID", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort });
      await transport.start(server);

      // Make initialize request
      const response = await fetch(`http://localhost:${testPort}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
              name: "test-client",
              version: "1.0.0"
            }
          },
          id: 1
        })
      });

      expect(response.status).toBe(200);

      // Check for session ID in headers
      const sessionId = response.headers.get("mcp-session-id");
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^[a-f0-9-]{36}$/); // UUID format

      // Parse SSE response
      const text = await response.text();
      expect(text).toContain("event: message");
      expect(text).toContain("data: ");

      // Extract JSON from SSE data
      const dataLine = text
        .split("\n")
        .find((line) => line.startsWith("data: "));
      expect(dataLine).toBeDefined();

      const jsonData = JSON.parse(dataLine!.substring(6));
      expect(jsonData).toMatchObject({
        jsonrpc: "2.0",
        id: 1,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            prompts: expect.any(Object)
          },
          serverInfo: {
            name: "test-mcp-server",
            version: "1.0.0"
          }
        }
      });
    });

    it("should require session ID for non-initialization requests", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 1 });
      await transport.start(server);

      // Try to list prompts without initializing
      const response = await fetch(`http://localhost:${testPort + 1}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "prompts/list",
          params: {},
          id: 2
        })
      });

      // MCP SDK returns 400 Bad Request for missing session ID
      expect(response.status).toBe(400);
      const data = (await response.json()) as {
        error?: { code: number; message: string };
      };

      // Should get an error about server not initialized (which happens when no session)
      expect(data).toMatchObject({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: expect.stringMatching(/initialized|Mcp-Session-Id/i)
        }
      });
    });

    it("should list prompts after initialization", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 2 });
      await transport.start(server);

      // Step 1: Initialize
      const initResponse = await fetch(`http://localhost:${testPort + 2}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
          },
          id: 1
        })
      });

      const sessionId = initResponse.headers.get("mcp-session-id");
      expect(sessionId).toBeDefined();

      // Step 2: Send initialized notification
      await fetch(`http://localhost:${testPort + 2}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Session-Id": sessionId!
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
          params: {}
        })
      });

      // Step 3: List prompts
      const listResponse = await fetch(`http://localhost:${testPort + 2}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Session-Id": sessionId!
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "prompts/list",
          params: {},
          id: 2
        })
      });

      expect(listResponse.status).toBe(200);
      const listText = await listResponse.text();

      // Parse SSE response
      const dataLine = listText
        .split("\n")
        .find((line) => line.startsWith("data: "));
      expect(dataLine).toBeDefined();

      const jsonData = JSON.parse(dataLine!.substring(6));
      expect(jsonData).toMatchObject({
        jsonrpc: "2.0",
        id: 2,
        result: {
          prompts: expect.arrayContaining([
            expect.objectContaining({
              name: "test-prompt-1",
              description: "First test prompt"
            }),
            expect.objectContaining({
              name: "test-prompt-2",
              description: "Second test prompt"
            })
          ])
        }
      });

      // Verify we got both prompts
      expect(jsonData.result.prompts).toHaveLength(2);
    });

    it("should get a specific prompt", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 3 });
      await transport.start(server);

      // Initialize
      const initResponse = await fetch(`http://localhost:${testPort + 3}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
          },
          id: 1
        })
      });

      const sessionId = initResponse.headers.get("mcp-session-id");

      // Send initialized notification
      await fetch(`http://localhost:${testPort + 3}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Session-Id": sessionId!
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
          params: {}
        })
      });

      // Get specific prompt
      const getResponse = await fetch(`http://localhost:${testPort + 3}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Session-Id": sessionId!
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "prompts/get",
          params: {
            name: "test-prompt-2",
            arguments: {
              input: "test value"
            }
          },
          id: 3
        })
      });

      expect(getResponse.status).toBe(200);
      const getText = await getResponse.text();

      // Parse SSE response
      const dataLine = getText
        .split("\n")
        .find((line) => line.startsWith("data: "));
      expect(dataLine).toBeDefined();

      const jsonData = JSON.parse(dataLine!.substring(6));
      expect(jsonData).toMatchObject({
        jsonrpc: "2.0",
        id: 3,
        result: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Test content 2"
              }
            }
          ]
        }
      });
    });

    it("should handle invalid JSON in request body", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 4 });
      await transport.start(server);

      // Send invalid JSON
      const response = await fetch(`http://localhost:${testPort + 4}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: "not valid json"
      });

      // MCP SDK returns 400 Bad Request for invalid JSON
      expect(response.status).toBe(400);
      const data = (await response.json()) as {
        error?: { code: number; message: string };
      };

      expect(data).toMatchObject({
        jsonrpc: "2.0",
        error: {
          code: expect.any(Number),
          message: expect.any(String)
        }
      });
    });

    it("should handle GET requests for health check", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 5 });
      await transport.start(server);

      // GET health endpoint
      const response = await fetch(`http://localhost:${testPort + 5}/health`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toMatchObject({
        status: "ok",
        transport: "http",
        timestamp: expect.any(String)
      });
    });

    it("should handle multiple concurrent requests", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 6 });
      await transport.start(server);

      // Make multiple initialize requests concurrently
      const requests = Array.from({ length: 5 }, (_, i) =>
        fetch(`http://localhost:${testPort + 6}/mcp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream"
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: { name: `test-${i}`, version: "1.0.0" }
            },
            id: i + 1
          })
        })
      );

      const responses = await Promise.all(requests);

      // All should succeed with 200 or some might get 400 if connection limit hit
      responses.forEach((response) => {
        expect([200, 400]).toContain(response.status);
      });

      // Get successful responses
      const successfulResponses = responses.filter((r) => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);

      // Each successful response should have a unique session ID
      const sessionIds = successfulResponses
        .map((r) => r.headers.get("mcp-session-id"))
        .filter((id) => id !== null);
      const uniqueIds = new Set(sessionIds);
      expect(uniqueIds.size).toBe(sessionIds.length);
    });

    it("should reject requests without Accept header", async () => {
      // Start server
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 7 });
      await transport.start(server);

      // Send request without proper Accept header
      const response = await fetch(`http://localhost:${testPort + 7}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Missing Accept header
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
          },
          id: 1
        })
      });

      // MCP SDK returns 406 Not Acceptable when Accept header is missing
      expect(response.status).toBe(406);
      const data = (await response.json()) as {
        error?: { code: number; message: string };
      };

      // Should get error about Accept header
      expect(data).toMatchObject({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: expect.stringContaining("accept")
        }
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle server not initialized error", async () => {
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 8 });
      await transport.start(server);

      // Try to call a method that requires initialization
      const response = await fetch(`http://localhost:${testPort + 8}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "prompts/list",
          params: {},
          id: 1
        })
      });

      const data = (await response.json()) as {
        error?: { code: number; message: string };
      };
      expect(data.error).toBeDefined();
      expect(data.error!.message).toContain("initialized");
    });

    it("should handle unknown method", async () => {
      const server = ServerFactory.createServer(config, promptManager);
      transport = new HttpTransport({ port: testPort + 9 });
      await transport.start(server);

      // Initialize first
      const initResponse = await fetch(`http://localhost:${testPort + 9}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
          },
          id: 1
        })
      });

      const sessionId = initResponse.headers.get("mcp-session-id");

      // Try unknown method
      const response = await fetch(`http://localhost:${testPort + 9}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Session-Id": sessionId!
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "unknown/method",
          params: {},
          id: 2
        })
      });

      const text = await response.text();
      const dataLine = text
        .split("\n")
        .find((line: string) => line.startsWith("data: "));
      const data = JSON.parse(dataLine!.substring(6)) as {
        error?: { code: number; message: string };
      };

      expect(data.error).toBeDefined();
    });
  });
});

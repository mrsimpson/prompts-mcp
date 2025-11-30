/**
 * Integration tests for prompt parameter substitution
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PromptManager } from "../../src/prompts/prompt-manager.js";
import { ServerFactory } from "../../src/server/server-factory.js";
import { HttpTransport } from "../../src/transports/http.js";
import type { Prompt } from "../../src/prompts/types.js";
import type { ServerConfig } from "../../src/config/types.js";

describe("Prompt Parameter Substitution", () => {
  let promptManager: PromptManager;
  let config: ServerConfig;
  let transport: HttpTransport | null = null;
  const basePort = 4000;
  let portOffset = 0;

  beforeEach(() => {
    promptManager = new PromptManager();
    config = {
      serverName: "test-server",
      serverVersion: "1.0.0",
      logLevel: "error",
      enableStdio: false,
      enableHttp: false,
      httpPort: 3000
    };
  });

  afterEach(async () => {
    if (transport) {
      await transport.stop();
      transport = null;
    }
  });

  async function initializeSession(port: number): Promise<string> {
    const initResponse = await fetch(`http://localhost:${port}/mcp`, {
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

    // Send initialized notification
    await fetch(`http://localhost:${port}/mcp`, {
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

    return sessionId!;
  }

  it("should substitute simple template variables", async () => {
    const port = basePort + portOffset++;

    const prompt: Prompt = {
      name: "greeting",
      description: "A simple greeting",
      tags: [],
      content: "Hello {{name}}! Welcome to {{place}}.",
      arguments: [
        { name: "name", description: "The person to greet", required: true },
        { name: "place", description: "The location", required: true }
      ],
      metadata: {
        filePath: "/test/greeting.md",
        source: "custom",
        loadedAt: new Date()
      }
    };

    promptManager.register(prompt);
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    const sessionId = await initializeSession(port);

    // Get prompt with arguments
    const response = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "prompts/get",
        params: {
          name: "greeting",
          arguments: {
            name: "Alice",
            place: "Wonderland"
          }
        },
        id: 2
      })
    });

    expect(response.status).toBe(200);
    const text = await response.text();

    // Parse SSE response
    const dataLine = text.split("\n").find((line) => line.startsWith("data: "));
    expect(dataLine).toBeDefined();

    const jsonData = JSON.parse(dataLine!.substring(6));
    expect(jsonData.result).toBeDefined();
    expect(jsonData.result.messages).toBeDefined();
    expect(jsonData.result.messages[0].content.text).toBe(
      "Hello Alice! Welcome to Wonderland."
    );
  });

  it("should handle optional parameters with #if conditionals", async () => {
    const port = basePort + portOffset++;

    const prompt: Prompt = {
      name: "code-review",
      description: "Review code with optional focus",
      tags: [],
      content: `Review this code:
{{code}}

{{#if language}}
Language: {{language}}
{{/if}}

{{#if focus}}
Focus on: {{focus}}
{{/if}}`,
      arguments: [
        { name: "code", description: "Code to review", required: true },
        {
          name: "language",
          description: "Programming language",
          required: false
        },
        { name: "focus", description: "Focus area", required: false }
      ],
      metadata: {
        filePath: "/test/code-review.md",
        source: "custom",
        loadedAt: new Date()
      }
    };

    promptManager.register(prompt);
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    const sessionId = await initializeSession(port);

    // Test with all parameters
    const responseWithAll = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "prompts/get",
        params: {
          name: "code-review",
          arguments: {
            code: 'console.log("test")',
            language: "JavaScript",
            focus: "security"
          }
        },
        id: 2
      })
    });

    expect(responseWithAll.status).toBe(200);
    const textResponseAll = await responseWithAll.text();
    const dataLineAll = textResponseAll
      .split("\n")
      .find((line) => line.startsWith("data: "));
    expect(dataLineAll).toBeDefined();
    const jsonDataAll = JSON.parse(dataLineAll!.substring(6));

    const textWithAll = jsonDataAll.result.messages[0].content.text;
    expect(textWithAll).toContain('console.log("test")');
    expect(textWithAll).toContain("Language: JavaScript");
    expect(textWithAll).toContain("Focus on: security");

    // Test with only required parameter
    const responseRequired = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "prompts/get",
        params: {
          name: "code-review",
          arguments: {
            code: 'print("hello")'
          }
        },
        id: 3
      })
    });

    expect(responseRequired.status).toBe(200);
    const textResponseReq = await responseRequired.text();
    const dataLineReq = textResponseReq
      .split("\n")
      .find((line) => line.startsWith("data: "));
    expect(dataLineReq).toBeDefined();
    const jsonDataReq = JSON.parse(dataLineReq!.substring(6));

    const textRequired = jsonDataReq.result.messages[0].content.text;
    expect(textRequired).toContain('print("hello")');
    expect(textRequired).not.toContain("Language:");
    expect(textRequired).not.toContain("Focus on:");
  });

  it("should handle prompts without parameters", async () => {
    const port = basePort + portOffset++;

    const prompt: Prompt = {
      name: "static",
      description: "A static prompt",
      tags: [],
      content: "This is a static prompt with no parameters.",
      metadata: {
        filePath: "/test/static.md",
        source: "custom",
        loadedAt: new Date()
      }
    };

    promptManager.register(prompt);
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    const sessionId = await initializeSession(port);

    const response = await fetch(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "prompts/get",
        params: {
          name: "static"
        },
        id: 2
      })
    });

    expect(response.status).toBe(200);
    const text = await response.text();
    const dataLine = text.split("\n").find((line) => line.startsWith("data: "));
    expect(dataLine).toBeDefined();
    const jsonData = JSON.parse(dataLine!.substring(6));

    expect(jsonData.result.messages[0].content.text).toBe(
      "This is a static prompt with no parameters."
    );
  });
});

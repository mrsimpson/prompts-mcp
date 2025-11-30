/**
 * Integration tests for HTTP transport
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { HttpTransport } from "../../src/transports/http.js";
import { ServerFactory } from "../../src/server/server-factory.js";
import { PromptManager } from "../../src/prompts/prompt-manager.js";
import { createLogger } from "../../src/utils/logger.js";
import type { ServerConfig } from "../../src/config/types.js";

describe("HttpTransport", () => {
  let transport: HttpTransport;
  let promptManager: PromptManager;
  let config: ServerConfig;

  beforeEach(() => {
    // Create fresh instances for each test
    promptManager = new PromptManager();
    config = {
      serverName: "test-server",
      serverVersion: "1.0.0",
      httpPort: 3000,
      logLevel: "error", // Suppress logs during tests
      enableStdio: false,
      enableHttp: true
    };

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

  describe("constructor", () => {
    it("should create transport with default options", () => {
      transport = new HttpTransport({ port: 3001 });
      expect(transport).toBeDefined();
      expect(transport.isRunning()).toBe(false);
      expect(transport.getPort()).toBe(3001);
    });

    it("should create transport with custom logger", () => {
      const logger = createLogger("CustomLogger");
      transport = new HttpTransport({ port: 3002, logger });
      expect(transport).toBeDefined();
    });

    it("should create transport with debug enabled", () => {
      transport = new HttpTransport({ port: 3003, debug: true });
      expect(transport).toBeDefined();
    });

    it("should create transport with sessions disabled", () => {
      transport = new HttpTransport({ port: 3004, enableSessions: false });
      expect(transport).toBeDefined();
    });

    it("should create transport with JSON responses enabled", () => {
      transport = new HttpTransport({ port: 3005, enableJsonResponse: true });
      expect(transport).toBeDefined();
    });
  });

  describe("start and stop", () => {
    it("should start transport with server", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create transport on a unique port
      transport = new HttpTransport({ port: 3010 });

      // Start transport
      await transport.start(server);

      expect(transport.isRunning()).toBe(true);
      expect(transport.getPort()).toBe(3010);
    });

    it("should stop transport gracefully", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create and start transport
      transport = new HttpTransport({ port: 3011 });
      await transport.start(server);
      expect(transport.isRunning()).toBe(true);

      // Stop transport
      await transport.stop();
      expect(transport.isRunning()).toBe(false);
    });

    it("should handle stop when not running", async () => {
      transport = new HttpTransport({ port: 3012 });

      // Should not throw when stopping before starting
      await expect(transport.stop()).resolves.toBeUndefined();
      expect(transport.isRunning()).toBe(false);
    });

    it("should handle multiple stop calls", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create and start transport
      transport = new HttpTransport({ port: 3013 });
      await transport.start(server);
      await transport.stop();

      // Second stop should not throw
      await expect(transport.stop()).resolves.toBeUndefined();
      expect(transport.isRunning()).toBe(false);
    });
  });

  describe("health check endpoint", () => {
    it("should respond to health check requests", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create and start transport
      transport = new HttpTransport({ port: 3014 });
      await transport.start(server);

      // Make health check request
      const response = await fetch("http://localhost:3014/health");
      expect(response.status).toBe(200);

      const data = (await response.json()) as {
        status: string;
        transport: string;
      };
      expect(data.status).toBe("ok");
      expect(data.transport).toBe("http");
    });
  });

  describe("isRunning", () => {
    it("should return false before starting", () => {
      transport = new HttpTransport({ port: 3015 });
      expect(transport.isRunning()).toBe(false);
    });

    it("should return true after starting", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create and start transport
      transport = new HttpTransport({ port: 3016 });
      await transport.start(server);
      expect(transport.isRunning()).toBe(true);
    });

    it("should return false after stopping", async () => {
      // Add a test prompt
      promptManager.register({
        name: "test-prompt",
        description: "Test prompt",
        content: "Test content",
        tags: [],
        metadata: {
          source: "custom",
          filePath: "/test/test-prompt.md",
          loadedAt: new Date()
        }
      });

      // Create server
      const server = ServerFactory.createServer(config, promptManager);

      // Create and start transport
      transport = new HttpTransport({ port: 3017 });
      await transport.start(server);
      await transport.stop();
      expect(transport.isRunning()).toBe(false);
    });
  });

  describe("getPort", () => {
    it("should return configured port", () => {
      transport = new HttpTransport({ port: 3018 });
      expect(transport.getPort()).toBe(3018);
    });
  });
});

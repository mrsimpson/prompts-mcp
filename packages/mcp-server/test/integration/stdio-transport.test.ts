/**
 * Integration tests for stdio transport
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StdioTransport } from "../../src/transports/stdio.js";
import { ServerFactory } from "../../src/server/server-factory.js";
import { PromptManager } from "../../src/prompts/prompt-manager.js";
import { createLogger } from "../../src/utils/logger.js";
import type { ServerConfig } from "../../src/config/types.js";

describe("StdioTransport", () => {
  let transport: StdioTransport;
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
      enableStdio: true,
      enableHttp: false
    };

    // Mock process.stderr.write to prevent log output during tests
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create transport with default options", () => {
      transport = new StdioTransport();
      expect(transport).toBeDefined();
      expect(transport.isRunning()).toBe(false);
    });

    it("should create transport with custom logger", () => {
      const logger = createLogger("CustomLogger");
      transport = new StdioTransport({ logger });
      expect(transport).toBeDefined();
    });

    it("should create transport with debug enabled", () => {
      transport = new StdioTransport({ debug: true });
      expect(transport).toBeDefined();
    });
  });

  describe("start and stop", () => {
    beforeEach(() => {
      transport = new StdioTransport();
    });

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

      // Mock the connect method since we can't actually connect in tests
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start transport
      await transport.start(server);

      expect(transport.isRunning()).toBe(true);
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

      // Mock the connect method
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start transport
      await transport.start(server);
      expect(transport.isRunning()).toBe(true);

      // Stop transport
      await transport.stop();
      expect(transport.isRunning()).toBe(false);
    });

    it("should handle stop when not running", async () => {
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

      // Mock the connect method
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start and stop
      await transport.start(server);
      await transport.stop();

      // Second stop should not throw
      await expect(transport.stop()).resolves.toBeUndefined();
      expect(transport.isRunning()).toBe(false);
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      transport = new StdioTransport();
    });

    it("should handle connection errors", async () => {
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

      // Mock connect to throw error
      const connectError = new Error("Connection failed");
      vi.spyOn(server, "connect").mockRejectedValue(connectError);

      // Should throw the error
      await expect(transport.start(server)).rejects.toThrow(
        "Connection failed"
      );
      expect(transport.isRunning()).toBe(false);
    });
  });

  describe("signal handling", () => {
    beforeEach(() => {
      transport = new StdioTransport();
    });

    it("should set up signal handlers on start", async () => {
      // Spy on process.on
      const processSpy = vi.spyOn(process, "on");

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

      // Mock the connect method
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start transport
      await transport.start(server);

      // Verify signal handlers were registered
      expect(processSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
      expect(processSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
      expect(processSpy).toHaveBeenCalledWith(
        "uncaughtException",
        expect.any(Function)
      );
      expect(processSpy).toHaveBeenCalledWith(
        "unhandledRejection",
        expect.any(Function)
      );

      processSpy.mockRestore();
    });
  });

  describe("isRunning", () => {
    beforeEach(() => {
      transport = new StdioTransport();
    });

    it("should return false before starting", () => {
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

      // Mock the connect method
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start transport
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

      // Mock the connect method
      vi.spyOn(server, "connect").mockResolvedValue();

      // Start and stop
      await transport.start(server);
      await transport.stop();
      expect(transport.isRunning()).toBe(false);
    });
  });
});

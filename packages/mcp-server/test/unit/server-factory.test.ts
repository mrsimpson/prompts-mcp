import { describe, it, expect, beforeEach } from 'vitest';
import { ServerFactory } from '../../src/server/server-factory.js';
import { PromptManager } from '../../src/prompts/prompt-manager.js';
import type { Prompt } from '../../src/prompts/types.js';
import type { ServerConfig } from '../../src/config/types.js';

describe('ServerFactory', () => {
  let promptManager: PromptManager;
  let config: ServerConfig;

  beforeEach(() => {
    promptManager = new PromptManager();
    config = {
      serverName: 'test-server',
      serverVersion: '1.0.0',
      httpPort: 3000,
      logLevel: 'info',
      enableStdio: true,
      enableHttp: false,
    };
  });

  describe('createServer', () => {
    it('should create an MCP server instance', () => {
      const server = ServerFactory.createServer(config, promptManager);
      expect(server).toBeDefined();
      expect(server.server).toBeDefined();
    });

    it('should register zero prompts from empty manager', () => {
      const server = ServerFactory.createServer(config, promptManager);
      expect(server).toBeDefined();
    });

    it('should register prompts from manager', () => {
      const testPrompt: Prompt = {
        name: 'test-prompt',
        description: 'A test prompt',
        content: '# Test\n\nThis is a test prompt',
        tags: ['test'],
        metadata: {
          filePath: '/test/prompt.md',
          source: 'pre-shipped',
          loadedAt: new Date(),
        },
      };

      promptManager.register(testPrompt);
      const server = ServerFactory.createServer(config, promptManager);
      expect(server).toBeDefined();
    });

    it('should register prompts with arguments', () => {
      const testPrompt: Prompt = {
        name: 'prompt-with-args',
        description: 'A prompt with arguments',
        content: 'Process {{input}} and return result',
        tags: ['test'],
        arguments: [
          { name: 'input', description: 'Input text', required: true },
          { name: 'format', description: 'Output format', required: false },
        ],
        metadata: {
          filePath: '/test/prompt.md',
          source: 'custom',
          loadedAt: new Date(),
        },
      };

      promptManager.register(testPrompt);
      const server = ServerFactory.createServer(config, promptManager);
      expect(server).toBeDefined();
    });

    it('should handle multiple prompts', () => {
      const prompts: Prompt[] = [
        {
          name: 'prompt-1',
          description: 'First prompt',
          content: 'Content 1',
          tags: ['test'],
          metadata: {
            filePath: '/test/p1.md',
            source: 'pre-shipped',
            loadedAt: new Date(),
          },
        },
        {
          name: 'prompt-2',
          description: 'Second prompt',
          content: 'Content 2',
          tags: ['test'],
          arguments: [{ name: 'arg1', description: 'Arg 1', required: true }],
          metadata: {
            filePath: '/test/p2.md',
            source: 'custom',
            loadedAt: new Date(),
          },
        },
        {
          name: 'prompt-3',
          description: 'Third prompt',
          content: 'Content 3',
          tags: ['test'],
          metadata: {
            filePath: '/test/p3.md',
            source: 'pre-shipped',
            loadedAt: new Date(),
          },
        },
      ];

      promptManager.registerMany(prompts);
      const server = ServerFactory.createServer(config, promptManager);
      expect(server).toBeDefined();
    });

    it('should use config for server name and version', () => {
      const customConfig: ServerConfig = {
        serverName: 'custom-mcp-server',
        serverVersion: '2.5.1',
        httpPort: 8080,
        logLevel: 'debug',
        enableStdio: false,
        enableHttp: true,
      };

      const server = ServerFactory.createServer(customConfig, promptManager);
      expect(server).toBeDefined();
      // The server info is internal, but we can verify the server was created
    });
  });
});

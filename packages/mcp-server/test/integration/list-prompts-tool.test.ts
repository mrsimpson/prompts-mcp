/**
 * Integration tests for the list_prompts tool
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpTransport } from '../../src/transports/http.js';
import { ServerFactory } from '../../src/server/server-factory.js';
import { PromptManager } from '../../src/prompts/prompt-manager.js';
import type { Prompt } from '../../src/prompts/types.js';
import type { ServerConfig } from '../../src/config/types.js';

describe('list_prompts tool', () => {
  let transport: HttpTransport;
  let promptManager: PromptManager;
  let config: ServerConfig;
  const testPort = 3500;
  let sessionId: string;

  beforeEach(() => {
    promptManager = new PromptManager();
    config = {
      serverName: 'test-server',
      serverVersion: '1.0.0',
      httpPort: testPort,
      logLevel: 'error',
      enableStdio: false,
      enableHttp: true,
    };

    // Mock stderr to suppress logs
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(async () => {
    if (transport && transport.isRunning()) {
      await transport.stop();
    }
    vi.restoreAllMocks();
  });

  async function initializeSession(port: number): Promise<string> {
    const response = await fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
        id: 1,
      }),
    });

    const sessionId = response.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('No session ID received');
    }
    return sessionId;
  }

  async function callTool(port: number, toolName: string, args: Record<string, unknown> = {}) {
    const response = await fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
        id: 2,
      }),
    });

    const text = await response.text();
    const dataLine = text.split('\n').find(line => line.startsWith('data: '));
    if (!dataLine) {
      throw new Error('No data line in SSE response');
    }
    return JSON.parse(dataLine.substring(6));
  }

  it('should list empty prompts when no prompts are registered', async () => {
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port: testPort });
    await transport.start(server);

    sessionId = await initializeSession(testPort);
    const result = await callTool(testPort, 'list_prompts');

    expect(result.result).toBeDefined();
    expect(result.result.content).toHaveLength(1);
    expect(result.result.content[0].type).toBe('text');

    const data = JSON.parse(result.result.content[0].text);
    expect(data).toEqual({
      prompts: [],
      total: 0,
    });
  });

  it('should list all registered prompts with metadata', async () => {
    const prompt1: Prompt = {
      name: 'test-prompt-1',
      description: 'First test prompt',
      tags: ['test', 'demo'],
      content: 'This is a test prompt',
      metadata: {
        filePath: '/test/prompt1.md',
        source: 'pre-shipped',
        loadedAt: new Date(),
      },
    };

    const prompt2: Prompt = {
      name: 'test-prompt-2',
      description: 'Second test prompt',
      tags: ['test'],
      content: 'This is another test prompt',
      arguments: [
        { name: 'arg1', description: 'First argument', required: true },
        { name: 'arg2', description: 'Second argument', required: false },
      ],
      metadata: {
        filePath: '/test/prompt2.md',
        source: 'custom',
        loadedAt: new Date(),
      },
    };

    promptManager.register(prompt1);
    promptManager.register(prompt2);

    const port = testPort + 1;
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    sessionId = await initializeSession(port);
    const result = await callTool(port, 'list_prompts');

    const data = JSON.parse(result.result.content[0].text);
    expect(data.total).toBe(2);
    expect(data.prompts).toHaveLength(2);

    const p1 = data.prompts.find((p: { name: string }) => p.name === 'test-prompt-1');
    expect(p1).toEqual({
      name: 'test-prompt-1',
      description: 'First test prompt',
      tags: ['test', 'demo'],
      arguments: [],
      source: 'pre-shipped',
    });

    const p2 = data.prompts.find((p: { name: string }) => p.name === 'test-prompt-2');
    expect(p2).toEqual({
      name: 'test-prompt-2',
      description: 'Second test prompt',
      tags: ['test'],
      arguments: [
        { name: 'arg1', description: 'First argument', required: true },
        { name: 'arg2', description: 'Second argument', required: false },
      ],
      source: 'custom',
    });
  });

  it('should handle prompts without optional fields', async () => {
    const prompt: Prompt = {
      name: 'minimal-prompt',
      description: 'Minimal prompt',
      tags: [],
      content: 'Content',
      metadata: {
        filePath: '/test/minimal.md',
        source: 'pre-shipped',
        loadedAt: new Date(),
      },
    };

    promptManager.register(prompt);

    const port = testPort + 2;
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    sessionId = await initializeSession(port);
    const result = await callTool(port, 'list_prompts');

    const data = JSON.parse(result.result.content[0].text);
    expect(data.total).toBe(1);
    expect(data.prompts[0]).toEqual({
      name: 'minimal-prompt',
      description: 'Minimal prompt',
      tags: [],
      arguments: [],
      source: 'pre-shipped',
    });
  });

  it('should return valid JSON', async () => {
    const prompt: Prompt = {
      name: 'json-test',
      description: 'Test JSON output',
      tags: ['json'],
      content: 'Content',
      arguments: [{ name: 'test', description: 'Test arg', required: true }],
      metadata: {
        filePath: '/test/json.md',
        source: 'custom',
        loadedAt: new Date(),
      },
    };

    promptManager.register(prompt);

    const port = testPort + 3;
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    sessionId = await initializeSession(port);
    const result = await callTool(port, 'list_prompts');

    const text = result.result.content[0].text;

    // Should not throw
    expect(() => JSON.parse(text)).not.toThrow();

    // Should be pretty-printed
    expect(text).toContain('\n');

    const data = JSON.parse(text);
    expect(data).toHaveProperty('prompts');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.prompts)).toBe(true);
    expect(typeof data.total).toBe('number');
  });

  it('should be listed in tools/list', async () => {
    const port = testPort + 4;
    const server = ServerFactory.createServer(config, promptManager);
    transport = new HttpTransport({ port });
    await transport.start(server);

    sessionId = await initializeSession(port);

    const response = await fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 3,
      }),
    });

    const text = await response.text();
    const dataLine = text.split('\n').find(line => line.startsWith('data: '));
    const result = JSON.parse(dataLine!.substring(6));

    expect(result.result.tools).toBeDefined();
    const listPromptsTool = result.result.tools.find(
      (t: { name: string }) => t.name === 'list_prompts'
    );
    expect(listPromptsTool).toBeDefined();
    expect(listPromptsTool.description).toBe(
      'List all available prompts with their metadata'
    );
  });
});

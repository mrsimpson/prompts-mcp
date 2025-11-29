/**
 * HTTP Transport Implementation
 *
 * Provides HTTP transport for remote MCP communication using Hono and
 * the MCP SDK's StreamableHTTPServerTransport.
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { StreamableHTTPServerTransport, type StreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createLogger, type Logger } from '../utils/logger.js';
import { randomUUID } from 'node:crypto';

/**
 * HTTP transport options
 */
export interface HttpTransportOptions {
  /**
   * Port to listen on
   */
  port: number;

  /**
   * Enable debug logging for transport events
   */
  debug?: boolean;

  /**
   * Custom logger instance (defaults to transport logger)
   */
  logger?: Logger;

  /**
   * Enable session management (stateful mode)
   * If false, uses stateless mode
   */
  enableSessions?: boolean;

  /**
   * Enable JSON responses instead of SSE streaming
   */
  enableJsonResponse?: boolean;
}

/**
 * HTTP Transport Manager
 *
 * Manages the HTTP transport lifecycle including:
 * - HTTP server setup with Hono
 * - MCP StreamableHTTPServerTransport integration
 * - Request routing and handling
 * - Graceful shutdown
 */
export class HttpTransport {
  private app: Hono;
  private httpServer: unknown = null;
  private transport: StreamableHTTPServerTransport | null = null;
  private server: McpServer | null = null;
  private logger: Logger;
  private debug: boolean;
  private port: number;
  private enableSessions: boolean;
  private enableJsonResponse: boolean;

  constructor(options: HttpTransportOptions) {
    this.logger = options.logger ?? createLogger('HttpTransport');
    this.debug = options.debug ?? false;
    this.port = options.port;
    this.enableSessions = options.enableSessions ?? true;
    this.enableJsonResponse = options.enableJsonResponse ?? false;

    // Create Hono app
    this.app = new Hono();

    // Setup routes
    this.setupRoutes();
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (c) => {
      return c.json({
        status: 'ok',
        transport: 'http',
        timestamp: new Date().toISOString(),
      });
    });

    // MCP endpoint - handle all HTTP methods
    this.app.all('/mcp', async (c) => {
      if (!this.transport) {
        return c.json({ error: 'Transport not initialized' }, 503);
      }

      try {
        const req = c.req.raw;
        
        // Create a promise that resolves when the response is ready
        const responseData = await new Promise<{
          statusCode: number;
          headers: Record<string, string>;
          body: string;
        }>((resolve) => {
          const res = {
            statusCode: 200,
            statusMessage: 'OK',
            _headers: {} as Record<string, string | string[]>,
            _body: '',
            headersSent: false,
            
            setHeader(name: string, value: string | string[]) {
              this._headers[name.toLowerCase()] = value;
              return this;
            },
            
            writeHead(statusCode: number, headers?: Record<string, string | string[]>) {
              this.statusCode = statusCode;
              if (headers) {
                Object.entries(headers).forEach(([key, value]) => {
                  this.setHeader(key, value);
                });
              }
              this.headersSent = true;
              return this; // Return this for chaining support
            },
            
            write(chunk: string | Buffer) {
              // For SSE streaming, accumulate chunks
              this._body += chunk.toString();
              return true;
            },
            
            end(data?: string | Buffer) {
              if (data) {
                this.write(data);
              }
              
              // Build response data
              const headers: Record<string, string> = {};
              Object.entries(this._headers).forEach(([key, value]) => {
                headers[key] = Array.isArray(value) ? value.join(', ') : value;
              });
              
              resolve({
                statusCode: this.statusCode,
                headers,
                body: this._body,
              });
            },
          };

          // Handle the request through MCP transport
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          void this.transport!.handleRequest(req as any, res as any);
        });
        
        // Return Hono response
        return new Response(responseData.body || '', {
          status: responseData.statusCode,
          headers: responseData.headers,
        });
      } catch (error) {
        const err = error as Error;
        this.logger.error(`HTTP transport: Request handling error: ${err.message}`);
        return c.json({ error: 'Internal server error' }, 500);
      }
    });
  }

  /**
   * Start the HTTP transport
   *
   * @param server - The MCP server instance to connect
   * @returns Promise that resolves when transport is started
   */
  async start(server: McpServer): Promise<void> {
    this.server = server;

    try {
      // Create MCP StreamableHTTP transport
      const options: StreamableHTTPServerTransportOptions = {
        sessionIdGenerator: this.enableSessions ? () => randomUUID() : undefined,
        enableJsonResponse: this.enableJsonResponse,
      };

      // Add optional callbacks only if sessions are enabled
      if (this.enableSessions) {
        options.onsessioninitialized = (sessionId) => {
          if (this.debug) {
            this.logger.debug(`HTTP transport: Session initialized: ${sessionId}`);
          }
        };
        options.onsessionclosed = (sessionId) => {
          if (this.debug) {
            this.logger.debug(`HTTP transport: Session closed: ${sessionId}`);
          }
        };
      }

      this.transport = new StreamableHTTPServerTransport(options);

      if (this.debug) {
        this.logger.debug('HTTP transport: Connecting MCP server to transport');
      }

      // Connect server to transport
      await server.connect(this.transport);

      if (this.debug) {
        this.logger.debug(`HTTP transport: Starting HTTP server on port ${this.port}`);
      }

      // Start HTTP server
      this.httpServer = serve({
        fetch: this.app.fetch,
        port: this.port,
      });

      this.logger.info(`HTTP transport: Server started on http://localhost:${this.port}`);
      this.logger.info(`HTTP transport: MCP endpoint: http://localhost:${this.port}/mcp`);
      this.logger.info(`HTTP transport: Health check: http://localhost:${this.port}/health`);

      if (this.debug) {
        this.logger.debug(
          `HTTP transport: Mode: ${this.enableSessions ? 'stateful (sessions enabled)' : 'stateless'}`
        );
        this.logger.debug(
          `HTTP transport: Response type: ${this.enableJsonResponse ? 'JSON' : 'SSE streaming'}`
        );
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`HTTP transport: Failed to start: ${err.message}`);
      
      // Clean up on failure
      this.transport = null;
      this.server = null;
      this.httpServer = null;
      
      throw error;
    }
  }

  /**
   * Stop the HTTP transport gracefully
   *
   * @returns Promise that resolves when transport is stopped
   */
  async stop(): Promise<void> {
    if (!this.httpServer && !this.transport) {
      return;
    }

    if (this.debug) {
      this.logger.debug('HTTP transport: Stopping transport');
    }

    try {
      // Close HTTP server first
      if (this.httpServer) {
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.httpServer as any).close((err: Error | null) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        this.httpServer = null;
      }

      // Then close MCP transport
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }

      this.server = null;

      this.logger.info('HTTP transport: Server stopped');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`HTTP transport: Error during shutdown: ${err.message}`);
      throw error;
    }
  }

  /**
   * Check if transport is running
   */
  isRunning(): boolean {
    return this.httpServer !== null && this.transport !== null && this.server !== null;
  }

  /**
   * Get the port the server is listening on
   */
  getPort(): number {
    return this.port;
  }
}

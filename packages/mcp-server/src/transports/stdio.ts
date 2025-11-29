/**
 * stdio Transport Implementation
 *
 * Provides stdio (standard input/output) transport for local MCP communication.
 * Handles process lifecycle, signal management, and graceful shutdown.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createLogger, type Logger } from '../utils/logger.js';

/**
 * Stdio transport options
 */
export interface StdioTransportOptions {
  /**
   * Enable debug logging for transport events
   */
  debug?: boolean;

  /**
   * Custom logger instance (defaults to transport logger)
   */
  logger?: Logger;
}

/**
 * Stdio Transport Manager
 *
 * Manages the stdio transport lifecycle including:
 * - Transport setup and connection
 * - Process signal handling (SIGINT, SIGTERM)
 * - Graceful shutdown
 * - Error handling
 */
export class StdioTransport {
  private transport: StdioServerTransport | null = null;
  private server: McpServer | null = null;
  private logger: Logger;
  private debug: boolean;

  constructor(options: StdioTransportOptions = {}) {
    this.logger = options.logger ?? createLogger('StdioTransport');
    this.debug = options.debug ?? false;
  }

  /**
   * Start the stdio transport
   *
   * @param server - The MCP server instance to connect
   * @returns Promise that resolves when transport is connected
   */
  async start(server: McpServer): Promise<void> {
    this.server = server;

    // Create stdio transport
    this.transport = new StdioServerTransport();

    if (this.debug) {
      this.logger.debug('stdio transport: Setting up transport');
    }

    // Set up signal handlers for graceful shutdown
    this.setupSignalHandlers();

    try {
      // Connect server to transport
      await server.connect(this.transport);

      this.logger.info('stdio transport: Server started on stdio');

      if (this.debug) {
        this.logger.debug('stdio transport: Listening for messages on stdin');
        this.logger.debug('stdio transport: Sending responses to stdout');
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`stdio transport: Failed to start: ${err.message}`);
      
      // Clean up on failure
      this.transport = null;
      this.server = null;
      
      throw error;
    }
  }

  /**
   * Stop the stdio transport gracefully
   *
   * @returns Promise that resolves when transport is stopped
   */
  async stop(): Promise<void> {
    if (!this.transport) {
      return;
    }

    if (this.debug) {
      this.logger.debug('stdio transport: Stopping transport');
    }

    try {
      // Close the transport
      await this.transport.close();
      this.transport = null;
      this.server = null;

      this.logger.info('stdio transport: Server stopped');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`stdio transport: Error during shutdown: ${err.message}`);
      throw error;
    }
  }

  /**
   * Set up process signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    const handleShutdown = async (signal: string): Promise<void> => {
      this.logger.info(`stdio transport: Received ${signal}, shutting down gracefully...`);

      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        const err = error as Error;
        this.logger.error(`stdio transport: Shutdown error: ${err.message}`);
        process.exit(1);
      }
    };

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      void handleShutdown('SIGINT');
    });

    // Handle SIGTERM (process termination)
    process.on('SIGTERM', () => {
      void handleShutdown('SIGTERM');
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      this.logger.error(`stdio transport: Uncaught exception: ${error.message}`);
      this.logger.error(error.stack ?? 'No stack trace available');
      void handleShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      const message = reason instanceof Error ? reason.message : String(reason);
      this.logger.error(`stdio transport: Unhandled rejection: ${message}`);
      void handleShutdown('unhandledRejection');
    });
  }

  /**
   * Check if transport is running
   */
  isRunning(): boolean {
    return this.transport !== null && this.server !== null;
  }
}

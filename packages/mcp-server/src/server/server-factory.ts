/**
 * Factory for creating and configuring MCP server instances
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config/types.js';
import type { PromptManager } from '../prompts/prompt-manager.js';
import { createLogger } from '../utils/logger.js';
import { z } from 'zod';

const logger = createLogger('ServerFactory');

/**
 * Creates and configures an MCP server instance with prompt capabilities
 */
export class ServerFactory {
  /**
   * Creates a new MCP server with the given configuration and prompts
   *
   * @param config - Server configuration
   * @param promptManager - Manager containing loaded prompts
   * @returns Configured MCP server instance
   */
  static createServer(
    config: ServerConfig,
    promptManager: PromptManager,
  ): McpServer {
    logger.info('Creating MCP server', {
      serverName: config.serverName,
      version: config.serverVersion,
    });

    // Create server instance
    const server = new McpServer(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          prompts: {},
        },
      },
    );

    // Register all prompts from the manager
    ServerFactory.registerPrompts(server, promptManager);

    logger.info('MCP server created successfully', {
      promptCount: promptManager.listPrompts().length,
    });

    return server;
  }

  /**
   * Registers all prompts from the PromptManager with the MCP server
   */
  private static registerPrompts(
    server: McpServer,
    promptManager: PromptManager,
  ): void {
    const prompts = promptManager.listPrompts();

    for (const prompt of prompts) {
      try {
        // Build args schema if prompt has arguments
        const argsSchema: Record<string, z.ZodTypeAny> = {};
        if (prompt.arguments && prompt.arguments.length > 0) {
          for (const arg of prompt.arguments) {
            // All arguments are strings in MCP prompts
            const schema = z.string().describe(arg.description);
            argsSchema[arg.name] = arg.required ? schema : schema.optional();
          }
        }

        // Register prompt with MCP server
        if (Object.keys(argsSchema).length > 0) {
          // Prompt with arguments
          server.registerPrompt(
            prompt.name,
            {
              description: prompt.description,
              argsSchema,
            },
            async (_args) => {
              return {
                messages: [
                  {
                    role: 'user',
                    content: {
                      type: 'text',
                      text: prompt.content,
                    },
                  },
                ],
              };
            },
          );
        } else {
          // Prompt without arguments
          server.registerPrompt(
            prompt.name,
            {
              description: prompt.description,
            },
            async (_args) => {
              return {
                messages: [
                  {
                    role: 'user',
                    content: {
                      type: 'text',
                      text: prompt.content,
                    },
                  },
                ],
              };
            },
          );
        }

        logger.info('Registered prompt', {
          name: prompt.name,
          argumentCount: prompt.arguments?.length || 0,
        });
      } catch (error) {
        logger.error('Failed to register prompt', error instanceof Error ? error : undefined);
      }
    }

    logger.info('All prompts registered', {
      totalPrompts: prompts.length,
    });
  }
}

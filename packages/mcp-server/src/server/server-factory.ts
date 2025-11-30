/**
 * Factory for creating and configuring MCP server instances
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../config/types.js";
import type { PromptManager } from "../prompts/prompt-manager.js";
import { createLogger } from "../utils/logger.js";
import { z } from "zod";
import Handlebars from "handlebars";

const logger = createLogger("ServerFactory");

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
    promptManager: PromptManager
  ): McpServer {
    logger.info("Creating MCP server", {
      serverName: config.serverName,
      version: config.serverVersion
    });

    // Create server instance
    const server = new McpServer(
      {
        name: config.serverName,
        version: config.serverVersion
      },
      {
        capabilities: {
          prompts: {},
          tools: {}
        }
      }
    );

    // Register all prompts from the manager
    ServerFactory.registerPrompts(server, promptManager);

    // Register tools
    ServerFactory.registerTools(server, promptManager);

    logger.info("MCP server created successfully", {
      promptCount: promptManager.listPrompts().length
    });

    return server;
  }

  /**
   * Registers tools with the MCP server
   */
  private static registerTools(
    server: McpServer,
    promptManager: PromptManager
  ): void {
    // Register list_prompts tool
    server.registerTool(
      "list_prompts",
      {
        description: "List all available prompts with their metadata"
      },
      async () => {
        const prompts = promptManager.listPrompts();

        // Build structured result
        const promptList = prompts.map((prompt) => ({
          name: prompt.name,
          description: prompt.description,
          tags: prompt.tags,
          arguments:
            prompt.arguments?.map((arg) => ({
              name: arg.name,
              description: arg.description,
              required: arg.required ?? false
            })) ?? [],
          source: prompt.metadata.source
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  prompts: promptList,
                  total: prompts.length
                },
                null,
                2
              )
            }
          ]
        };
      }
    );

    logger.info("Tools registered successfully", {
      toolCount: 1
    });
  }

  /**
   * Registers all prompts from the PromptManager with the MCP server
   */
  private static registerPrompts(
    server: McpServer,
    promptManager: PromptManager
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
          // Prompt with arguments - use Handlebars for template substitution
          server.registerPrompt(
            prompt.name,
            {
              description: prompt.description,
              argsSchema
            },
            async (args) => {
              // Compile and render the template with provided arguments
              // Use noEscape: true to prevent HTML escaping in code snippets
              const template = Handlebars.compile(prompt.content, {
                noEscape: true
              });
              const renderedContent = template(args);

              return {
                messages: [
                  {
                    role: "user",
                    content: {
                      type: "text",
                      text: renderedContent
                    }
                  }
                ]
              };
            }
          );
        } else {
          // Prompt without arguments
          server.registerPrompt(
            prompt.name,
            {
              description: prompt.description
            },
            async () => {
              return {
                messages: [
                  {
                    role: "user",
                    content: {
                      type: "text",
                      text: prompt.content
                    }
                  }
                ]
              };
            }
          );
        }

        logger.info("Registered prompt", {
          name: prompt.name,
          argumentCount: prompt.arguments?.length || 0
        });
      } catch (error) {
        logger.error(
          "Failed to register prompt",
          error instanceof Error ? error : undefined
        );
      }
    }

    logger.info("All prompts registered", {
      totalPrompts: prompts.length
    });
  }
}

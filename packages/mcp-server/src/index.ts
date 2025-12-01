/**
 * Main entry point for MCP Prompts Server
 *
 * This module orchestrates:
 * - Configuration loading
 * - Prompt loading (pre-shipped + user)
 * - Server initialization
 * - Transport setup (stdio and/or HTTP)
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { loadConfig } from "./config/config.js";
import { PromptLoader } from "./prompts/prompt-loader.js";
import { PromptManager } from "./prompts/prompt-manager.js";
import { ServerFactory } from "./server/server-factory.js";
import { StdioTransport } from "./transports/stdio.js";
import { HttpTransport } from "./transports/http.js";
import { createLogger } from "./utils/logger.js";
import { discoverDirectory } from "./utils/directory-discovery.js";
import { USER_PROMPTS_SUBDIR } from "./constants.js";

const logger = createLogger("Main");

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Start the MCP Prompts Server
 */
export async function startServer(): Promise<void> {
  try {
    logger.info("Starting MCP Prompts Server...");

    // Load configuration
    const config = loadConfig();
    logger.info("Configuration loaded", {
      serverName: config.serverName,
      version: config.serverVersion,
      logLevel: config.logLevel,
      enableStdio: config.enableStdio,
      enableHttp: config.enableHttp,
      httpPort: config.httpPort
    });

    // Initialize prompt manager
    const promptManager = new PromptManager();

    // Load pre-shipped prompts
    const preShippedDir = resolve(__dirname, "../resources/prompts");
    logger.info(`Loading pre-shipped prompts from: ${preShippedDir}`);

    const preShippedResult =
      await PromptLoader.loadFromDirectory(preShippedDir);

    // Mark all pre-shipped prompts as such
    preShippedResult.prompts.forEach((prompt) => {
      prompt.metadata.source = "pre-shipped";
    });

    promptManager.registerMany(preShippedResult.prompts);

    logger.info(
      `Loaded ${preShippedResult.prompts.length} pre-shipped prompt(s)`
    );
    if (preShippedResult.errors.length > 0) {
      logger.warn(
        `Failed to load ${preShippedResult.errors.length} pre-shipped prompt(s)`
      );
    }

    // Load user prompts using directory discovery
    const userPromptsDiscovery = discoverDirectory({
      subdirEnvPrefix: "PROMPTS",
      subdir: USER_PROMPTS_SUBDIR,
      useHomeFallback: true
    });

    logger.info(
      `User prompts directory: ${userPromptsDiscovery.path} (source: ${userPromptsDiscovery.source})`
    );

    if (userPromptsDiscovery.exists) {
      logger.info(`Loading user prompts from: ${userPromptsDiscovery.path}`);

      const userPromptsResult = await PromptLoader.loadFromDirectory(
        userPromptsDiscovery.path
      );

      // Mark all user prompts as custom source
      userPromptsResult.prompts.forEach((prompt) => {
        prompt.metadata.source = "custom";
      });

      promptManager.registerMany(userPromptsResult.prompts);

      logger.info(`Loaded ${userPromptsResult.prompts.length} user prompt(s)`);
      if (userPromptsResult.errors.length > 0) {
        logger.warn(
          `Failed to load ${userPromptsResult.errors.length} user prompt(s)`
        );
      }
    } else {
      logger.info(
        `No user prompts directory found at ${userPromptsDiscovery.path} (${userPromptsDiscovery.source}). This is normal if you don't have user prompts yet.`
      );
    }

    // Log total prompts available
    const totalPrompts = promptManager.listPrompts().length;
    logger.info(`Total prompts available: ${totalPrompts}`);

    if (totalPrompts === 0) {
      logger.warn(
        "No prompts loaded! Server will start but have no prompts to serve."
      );
    }

    // Create MCP server
    logger.info("Creating MCP server...");
    const server = ServerFactory.createServer(config, promptManager);

    // Setup transports
    const transports: Array<StdioTransport | HttpTransport> = [];

    if (config.enableStdio) {
      logger.info("Setting up stdio transport...");
      const stdioTransport = new StdioTransport({
        debug: config.logLevel === "debug"
      });
      await stdioTransport.start(server);
      transports.push(stdioTransport);
    }

    if (config.enableHttp) {
      logger.info(`Setting up HTTP transport on port ${config.httpPort}...`);
      const httpTransport = new HttpTransport({
        port: config.httpPort,
        debug: config.logLevel === "debug"
      });
      await httpTransport.start(server);
      transports.push(httpTransport);
    }

    if (transports.length === 0) {
      logger.error(
        "No transports enabled! Enable at least one transport (stdio or HTTP)."
      );
      process.exit(1);
    }

    logger.info("MCP Prompts Server started successfully!");
    logger.info(
      `Serving ${totalPrompts} prompt(s) via ${transports.length} transport(s)`
    );
  } catch (error) {
    const err = error as Error;
    logger.error(`Failed to start server: ${err.message}`);
    logger.error(err.stack || "No stack trace available");
    throw error;
  }
}

/**
 * Export individual components for programmatic use
 */
export { loadConfig } from "./config/config.js";
export { PromptLoader } from "./prompts/prompt-loader.js";
export { PromptManager } from "./prompts/prompt-manager.js";
export { ServerFactory } from "./server/server-factory.js";
export { StdioTransport } from "./transports/stdio.js";
export { HttpTransport } from "./transports/http.js";
export * from "./config/types.js";
export * from "./prompts/types.js";

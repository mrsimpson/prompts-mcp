/**
 * Configuration loader and manager
 */

import type { ServerConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./defaults.js";
import { loadConfigFromEnv } from "./env.js";
import { ConfigurationError } from "../utils/errors.js";

/**
 * Validate server configuration
 */
function validateConfig(config: ServerConfig): void {
  // At least one transport must be enabled
  if (!config.enableStdio && !config.enableHttp) {
    throw new ConfigurationError(
      "At least one transport (stdio or HTTP) must be enabled"
    );
  }

  // Validate custom prompts directory if provided
  if (config.customPromptsDir && typeof config.customPromptsDir !== "string") {
    throw new ConfigurationError("customPromptsDir must be a string");
  }
}

/**
 * Load and merge configuration from multiple sources
 * Priority: CLI args > Environment variables > Defaults
 */
export function loadConfig(cliConfig?: Partial<ServerConfig>): ServerConfig {
  // Start with defaults
  const config: ServerConfig = { ...DEFAULT_CONFIG };

  // Merge environment variables
  const envConfig = loadConfigFromEnv();
  Object.assign(config, envConfig);

  // Merge CLI arguments (highest priority)
  if (cliConfig) {
    Object.assign(config, cliConfig);
  }

  // Validate final configuration
  validateConfig(config);

  return config;
}

/**
 * Environment variable parser for configuration
 */

import type { ServerConfig, LogLevel } from './types.js';
import { DEFAULT_CONFIG, MIN_PORT, MAX_PORT } from './defaults.js';
import { ConfigurationError } from '../utils/errors.js';

/**
 * Parse log level from string
 */
function parseLogLevel(value: string | undefined): LogLevel {
  if (!value) return DEFAULT_CONFIG.logLevel;

  const level = value.toLowerCase() as LogLevel;
  if (['error', 'warn', 'info', 'debug'].includes(level)) {
    return level;
  }

  throw new ConfigurationError(
    `Invalid log level: ${value}. Must be one of: error, warn, info, debug`,
  );
}

/**
 * Parse port number from string
 */
function parsePort(value: string | undefined): number {
  if (!value) return DEFAULT_CONFIG.httpPort;

  const port = parseInt(value, 10);
  if (isNaN(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new ConfigurationError(
      `Invalid port: ${value}. Must be between ${MIN_PORT} and ${MAX_PORT}`,
    );
  }

  return port;
}

/**
 * Parse boolean from string
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;

  const lower = value.toLowerCase();
  if (['true', '1', 'yes'].includes(lower)) return true;
  if (['false', '0', 'no'].includes(lower)) return false;

  return defaultValue;
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<ServerConfig> {
  const config: Partial<ServerConfig> = {};

  // Custom prompts directory
  if (process.env['CUSTOM_PROMPTS_DIR']) {
    config.customPromptsDir = process.env['CUSTOM_PROMPTS_DIR'];
  }

  // HTTP port
  if (process.env['HTTP_PORT']) {
    config.httpPort = parsePort(process.env['HTTP_PORT']);
  }

  // Log level
  if (process.env['LOG_LEVEL']) {
    config.logLevel = parseLogLevel(process.env['LOG_LEVEL']);
  }

  // Enable stdio
  if (process.env['ENABLE_STDIO']) {
    config.enableStdio = parseBoolean(process.env['ENABLE_STDIO'], DEFAULT_CONFIG.enableStdio);
  }

  // Enable HTTP
  if (process.env['ENABLE_HTTP']) {
    config.enableHttp = parseBoolean(process.env['ENABLE_HTTP'], DEFAULT_CONFIG.enableHttp);
  }

  return config;
}

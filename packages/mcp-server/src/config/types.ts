/**
 * Configuration type definitions
 */

/** Log level */
export type LogLevel = "error" | "warn" | "info" | "debug";

/** Transport type */
export type TransportType = "stdio" | "http";

/**
 * Server configuration
 */
export interface ServerConfig {
  /** Server name for MCP identification */
  serverName: string;
  /** Server version */
  serverVersion: string;
  /** Optional custom prompts directory */
  customPromptsDir?: string;
  /** HTTP server port */
  httpPort: number;
  /** Logging level */
  logLevel: LogLevel;
  /** Enable stdio transport */
  enableStdio: boolean;
  /** Enable HTTP transport */
  enableHttp: boolean;
}

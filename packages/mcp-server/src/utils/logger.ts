/**
 * Simple logger utility for MCP Prompts Server
 * Logs to stderr (stdout is reserved for stdio MCP protocol)
 */

import type { LogLevel } from '../config/types.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class Logger {
  constructor(
    private component: string,
    private level: LogLevel = 'info',
  ) {}

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Check if a message at the given level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  /**
   * Format and write log message to stderr
   */
  private writeLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      ...(context && { context }),
    };

    // Write to stderr (stdout is used for MCP protocol)
    process.stderr.write(JSON.stringify(logEntry) + '\n');
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | Record<string, unknown>): void {
    const context = error instanceof Error ? { error: error.message, stack: error.stack } : error;
    this.writeLog('error', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.writeLog('info', message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.writeLog('debug', message, context);
  }
}

/**
 * Create a logger instance for a component
 */
export function createLogger(component: string, level: LogLevel = 'info'): Logger {
  return new Logger(component, level);
}

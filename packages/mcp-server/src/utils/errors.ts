/**
 * Custom error types for the MCP Prompts Server
 */

/**
 * Base error class for all server errors
 */
export class MCPPromptsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MCPPromptsError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a prompt file cannot be parsed
 */
export class PromptParseError extends MCPPromptsError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "PromptParseError";
  }
}

/**
 * Error thrown when a prompt fails validation
 */
export class PromptValidationError extends MCPPromptsError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly errors: string[]
  ) {
    super(message);
    this.name = "PromptValidationError";
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends MCPPromptsError {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Error thrown when a prompt is not found
 */
export class PromptNotFoundError extends MCPPromptsError {
  constructor(public readonly promptName: string) {
    super(`Prompt not found: ${promptName}`);
    this.name = "PromptNotFoundError";
  }
}

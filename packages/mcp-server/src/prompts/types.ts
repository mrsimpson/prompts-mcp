/**
 * Core type definitions for prompt management
 */

/**
 * Argument definition for a prompt
 */
export interface PromptArgument {
  /** Argument name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Whether this argument is required (defaults to false) */
  required?: boolean;
}

/**
 * Metadata about a prompt's origin and loading
 */
export interface PromptMetadata {
  /** Path to the source file */
  filePath: string;
  /** Origin of the prompt */
  source: 'pre-shipped' | 'custom';
  /** When the prompt was loaded */
  loadedAt: Date;
}

/**
 * Complete prompt definition
 */
export interface Prompt {
  /** Unique identifier for the prompt */
  name: string;
  /** Human-readable description */
  description: string;
  /** Categorization tags */
  tags: string[];
  /** The actual prompt content (markdown) */
  content: string;
  /** Optional arguments that can be filled in */
  arguments?: PromptArgument[];
  /** Metadata about the prompt */
  metadata: PromptMetadata;
}

/**
 * Front matter extracted from prompt markdown file
 */
export interface PromptFrontMatter {
  name: string;
  description: string;
  tags?: string[];
  arguments?: PromptArgument[];
  [key: string]: unknown; // Allow additional fields
}

/**
 * Result of parsing a prompt file
 */
export interface ParseResult {
  success: boolean;
  prompt?: Prompt;
  error?: ParseError;
}

/**
 * Error that occurred during parsing
 */
export interface ParseError {
  message: string;
  filePath: string;
  details?: string;
}

/**
 * Result of validating a prompt
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Type guard to check if an object is a PromptArgument
 */
export function isPromptArgument(obj: unknown): obj is PromptArgument {
  if (typeof obj !== 'object' || obj === null) return false;
  const arg = obj as Record<string, unknown>;
  return (
    typeof arg['name'] === 'string' &&
    typeof arg['description'] === 'string' &&
    typeof arg['required'] === 'boolean'
  );
}

/**
 * Type guard to check if an object is valid PromptFrontMatter
 */
export function isPromptFrontMatter(obj: unknown): obj is PromptFrontMatter {
  if (typeof obj !== 'object' || obj === null) return false;
  const fm = obj as Record<string, unknown>;

  // Required fields
  if (typeof fm['name'] !== 'string' || !fm['name']) return false;
  if (typeof fm['description'] !== 'string' || !fm['description']) return false;

  // Optional tags field
  if (fm['tags'] !== undefined) {
    if (!Array.isArray(fm['tags'])) return false;
    if (!fm['tags'].every((tag) => typeof tag === 'string')) return false;
  }

  // Optional arguments field
  if (fm['arguments'] !== undefined) {
    if (!Array.isArray(fm['arguments'])) return false;
    if (!fm['arguments'].every(isPromptArgument)) return false;
  }

  return true;
}

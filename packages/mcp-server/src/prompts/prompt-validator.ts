import type { PromptArgument } from "./types.js";
import { PromptValidationError } from "../utils/errors.js";

/**
 * Input for validation - subset of Prompt fields that need validation
 */
export interface ValidatablePrompt {
  name: string;
  description: string;
  tags?: string[];
  arguments?: PromptArgument[];
}

/**
 * Validation result with collected errors
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates prompt metadata and content
 */
export class PromptValidator {
  /**
   * Validates a prompt object
   * @param prompt - The prompt to validate
   * @param filePath - The file path of the prompt (for error reporting)
   * @throws {PromptValidationError} If validation fails
   */
  static validate(prompt: ValidatablePrompt, filePath: string): void {
    const result = this.validatePrompt(prompt);
    if (!result.valid) {
      throw new PromptValidationError(
        "Prompt validation failed",
        filePath,
        result.errors
      );
    }
  }

  /**
   * Validates a prompt and returns a result object
   * @param prompt - The prompt to validate
   * @returns Validation result with errors
   */
  static validatePrompt(prompt: ValidatablePrompt): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!prompt.name && prompt.name !== "") {
      errors.push("Prompt name is required");
    }
    if (prompt.name !== undefined) {
      errors.push(...this.validateName(prompt.name));
    }

    if (!prompt.description && prompt.description !== "") {
      errors.push("Prompt description is required");
    }
    if (prompt.description !== undefined) {
      errors.push(...this.validateDescription(prompt.description));
    }

    // Validate optional fields
    if (prompt.tags !== undefined) {
      errors.push(...this.validateTags(prompt.tags));
    }

    if (prompt.arguments !== undefined) {
      errors.push(...this.validateArguments(prompt.arguments));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates prompt name
   * @returns Array of error messages (empty if valid)
   */
  private static validateName(name: string): string[] {
    const errors: string[] = [];

    if (typeof name !== "string") {
      errors.push("Prompt name must be a string");
      return errors;
    }

    if (name.trim().length === 0) {
      errors.push("Prompt name cannot be empty or whitespace only");
    }

    if (name.length > 100) {
      errors.push("Prompt name must be 100 characters or less");
    }

    // Name should be a valid identifier (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push(
        "Prompt name must contain only alphanumeric characters, hyphens, and underscores"
      );
    }

    return errors;
  }

  /**
   * Validates prompt description
   * @returns Array of error messages (empty if valid)
   */
  private static validateDescription(description: string): string[] {
    const errors: string[] = [];

    if (typeof description !== "string") {
      errors.push("Prompt description must be a string");
      return errors;
    }

    if (description.trim().length === 0) {
      errors.push("Prompt description cannot be empty or whitespace only");
    }

    if (description.length > 500) {
      errors.push("Prompt description must be 500 characters or less");
    }

    return errors;
  }

  /**
   * Validates tags array (optional)
   * @returns Array of error messages (empty if valid)
   */
  private static validateTags(tags: string[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(tags)) {
      errors.push("Prompt tags must be an array");
      return errors;
    }

    for (const tag of tags) {
      if (typeof tag !== "string") {
        errors.push("Each tag must be a string");
        continue;
      }

      if (tag.trim().length === 0) {
        errors.push("Tags cannot be empty or whitespace only");
      }

      if (tag.length > 50) {
        errors.push(`Tag "${tag}" must be 50 characters or less`);
      }
    }

    // Check for duplicate tags
    const uniqueTags = new Set(tags);
    if (uniqueTags.size !== tags.length) {
      errors.push("Duplicate tags are not allowed");
    }

    return errors;
  }

  /**
   * Validates arguments array (optional)
   * @returns Array of error messages (empty if valid)
   */
  private static validateArguments(args: PromptArgument[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(args)) {
      errors.push("Prompt arguments must be an array");
      return errors;
    }

    const argNames = new Set<string>();

    for (const arg of args) {
      errors.push(...this.validateArgument(arg));

      // Check for duplicate argument names
      if (argNames.has(arg.name)) {
        errors.push(`Duplicate argument name: ${arg.name}`);
      }
      argNames.add(arg.name);
    }

    return errors;
  }

  /**
   * Validates a single prompt argument
   * @returns Array of error messages (empty if valid)
   */
  private static validateArgument(arg: PromptArgument): string[] {
    const errors: string[] = [];

    if (typeof arg !== "object" || arg === null) {
      errors.push("Each argument must be an object");
      return errors;
    }

    // Validate name
    if ((!arg.name && arg.name !== "") || typeof arg.name !== "string") {
      errors.push("Argument name is required and must be a string");
    }
    if (typeof arg.name === "string") {
      if (arg.name.trim().length === 0) {
        errors.push("Argument name cannot be empty or whitespace only");
      }

      if (arg.name.length > 50) {
        errors.push(
          `Argument name "${arg.name}" must be 50 characters or less`
        );
      }
    }

    // Validate description
    if (
      (!arg.description && arg.description !== "") ||
      typeof arg.description !== "string"
    ) {
      errors.push(
        `Argument description is required and must be a string for argument: ${arg.name || "unnamed"}`
      );
    }
    if (typeof arg.description === "string") {
      if (arg.description.trim().length === 0) {
        errors.push(
          `Argument description cannot be empty for argument: ${arg.name}`
        );
      }

      if (arg.description.length > 200) {
        errors.push(
          `Argument description must be 200 characters or less for argument: ${arg.name}`
        );
      }
    }

    // Validate required field (optional)
    if (arg.required !== undefined && typeof arg.required !== "boolean") {
      errors.push(
        `Argument 'required' field must be a boolean for argument: ${arg.name || "unnamed"}`
      );
    }

    return errors;
  }

  /**
   * Checks if a prompt is valid without throwing
   * @param prompt - The prompt to validate
   * @returns true if valid, false otherwise
   */
  static isValid(prompt: ValidatablePrompt): boolean {
    const result = this.validatePrompt(prompt);
    return result.valid;
  }
}

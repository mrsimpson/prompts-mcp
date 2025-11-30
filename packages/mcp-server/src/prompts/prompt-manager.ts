import type { Prompt } from "./types.js";
import { PromptNotFoundError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("PromptManager");

/**
 * Manages a collection of prompts with precedence rules
 * Custom prompts override pre-shipped prompts with the same name
 */
export class PromptManager {
  private prompts: Map<string, Prompt> = new Map();

  /**
   * Register a prompt
   * @param prompt - The prompt to register
   * @param allowOverride - Whether to allow overriding existing prompts (default: true)
   */
  register(prompt: Prompt, allowOverride = true): void {
    const existing = this.prompts.get(prompt.name);

    if (existing && !allowOverride) {
      logger.warn(
        `Prompt ${prompt.name} already exists and override is disabled`
      );
      return;
    }

    // Custom prompts override pre-shipped ones
    if (existing) {
      if (
        prompt.metadata.source === "custom" &&
        existing.metadata.source === "pre-shipped"
      ) {
        logger.info(
          `Custom prompt ${prompt.name} overrides pre-shipped version`
        );
        this.prompts.set(prompt.name, prompt);
      } else if (
        prompt.metadata.source === "pre-shipped" &&
        existing.metadata.source === "custom"
      ) {
        logger.debug(
          `Keeping custom prompt ${prompt.name}, ignoring pre-shipped version`
        );
        // Don't override - custom takes precedence
      } else {
        // Same source - last one wins
        logger.warn(
          `Duplicate prompt ${prompt.name} from ${prompt.metadata.source}, using latest`
        );
        this.prompts.set(prompt.name, prompt);
      }
    } else {
      this.prompts.set(prompt.name, prompt);
      logger.debug(
        `Registered prompt: ${prompt.name} (${prompt.metadata.source})`
      );
    }
  }

  /**
   * Register multiple prompts
   * @param prompts - Array of prompts to register
   */
  registerMany(prompts: Prompt[]): void {
    for (const prompt of prompts) {
      this.register(prompt);
    }
  }

  /**
   * Get a prompt by name
   * @param name - The prompt name
   * @returns The prompt
   * @throws {PromptNotFoundError} If prompt doesn't exist
   */
  getPrompt(name: string): Prompt {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new PromptNotFoundError(name);
    }
    return prompt;
  }

  /**
   * Check if a prompt exists
   * @param name - The prompt name
   * @returns true if prompt exists
   */
  hasPrompt(name: string): boolean {
    return this.prompts.has(name);
  }

  /**
   * Get all prompts
   * @returns Array of all registered prompts
   */
  listPrompts(): Prompt[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Get prompts filtered by tag
   * @param tag - Tag to filter by
   * @returns Array of prompts with the specified tag
   */
  getPromptsByTag(tag: string): Prompt[] {
    return this.listPrompts().filter((prompt) => prompt.tags.includes(tag));
  }

  /**
   * Get prompts filtered by source
   * @param source - Source to filter by ('pre-shipped' or 'custom')
   * @returns Array of prompts from the specified source
   */
  getPromptsBySource(source: "pre-shipped" | "custom"): Prompt[] {
    return this.listPrompts().filter(
      (prompt) => prompt.metadata.source === source
    );
  }

  /**
   * Clear all prompts
   */
  clear(): void {
    this.prompts.clear();
    logger.debug("Cleared all prompts");
  }

  /**
   * Get the total number of prompts
   * @returns Number of registered prompts
   */
  count(): number {
    return this.prompts.size;
  }

  /**
   * Get all unique tags across all prompts
   * @returns Sorted array of unique tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const prompt of this.prompts.values()) {
      for (const tag of prompt.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }
}

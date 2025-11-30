import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Prompt } from "./types.js";
import { parsePromptFile } from "./prompt-parser.js";
import { PromptValidator } from "./prompt-validator.js";
import { createLogger } from "../utils/logger.js";
import { PromptParseError } from "../utils/errors.js";

const logger = createLogger("PromptLoader");

/**
 * Result of loading prompts from a directory
 */
export interface LoadResult {
  prompts: Prompt[];
  errors: Array<{
    filePath: string;
    error: Error;
  }>;
}

/**
 * Loads and validates prompt files from a directory
 */
export class PromptLoader {
  /**
   * Loads all prompt files from a directory
   * @param directoryPath - Path to the directory containing prompt files
   * @returns Load result with prompts and any errors encountered
   */
  static async loadFromDirectory(directoryPath: string): Promise<LoadResult> {
    const prompts: Prompt[] = [];
    const errors: Array<{ filePath: string; error: Error }> = [];

    try {
      const files = await this.findPromptFiles(directoryPath);
      logger.info(`Found ${files.length} prompt file(s) in ${directoryPath}`);

      for (const filePath of files) {
        try {
          const prompt = await this.loadPromptFile(filePath);
          prompts.push(prompt);
          logger.debug(`Loaded prompt: ${prompt.name} from ${filePath}`);
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          errors.push({ filePath, error: errorObj });
          logger.warn(
            `Failed to load prompt from ${filePath}: ${errorObj.message}`
          );
        }
      }

      logger.info(
        `Successfully loaded ${prompts.length} prompt(s), ${errors.length} error(s)`
      );
    } catch (error) {
      logger.error(`Failed to read directory ${directoryPath}: ${error}`);
      throw error;
    }

    return { prompts, errors };
  }

  /**
   * Loads a single prompt file
   * @param filePath - Path to the prompt file
   * @param source - Origin of the prompt ('pre-shipped' or 'custom')
   * @returns Parsed and validated prompt
   * @throws {PromptParseError | PromptValidationError} If parsing or validation fails
   */
  static async loadPromptFile(
    filePath: string,
    source: "pre-shipped" | "custom" = "custom"
  ): Promise<Prompt> {
    // Read file contents
    const content = await fs.readFile(filePath, "utf-8");

    // Parse the prompt
    const parseResult = parsePromptFile(filePath, content, source);

    // Check if parsing was successful
    if (!parseResult.success) {
      const { message, filePath: errPath, details } = parseResult.error!;
      throw new PromptParseError(message, errPath, details);
    }

    const prompt = parseResult.prompt!;

    // Validate the prompt
    PromptValidator.validate(prompt, filePath);

    return prompt;
  }

  /**
   * Finds all .md files in a directory (non-recursive)
   * @param directoryPath - Path to the directory to scan
   * @returns Array of absolute file paths
   */
  private static async findPromptFiles(
    directoryPath: string
  ): Promise<string[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    const promptFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(directoryPath, entry.name));

    return promptFiles;
  }

  /**
   * Checks if a directory exists and is accessible
   * @param directoryPath - Path to check
   * @returns true if directory exists and is accessible
   */
  static async directoryExists(directoryPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(directoryPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
}

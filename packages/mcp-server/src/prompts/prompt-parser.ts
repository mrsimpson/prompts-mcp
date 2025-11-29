/**
 * Prompt parser - extracts front matter and content from markdown files
 */

import matter from 'gray-matter';
import type { Prompt, ParseResult, PromptFrontMatter } from './types.js';
import { isPromptFrontMatter } from './types.js';
import { PromptParseError } from '../utils/errors.js';

/**
 * Parse a prompt markdown file
 *
 * @param filePath - Path to the file being parsed (for error messages)
 * @param content - Raw file content
 * @param source - Origin of the prompt ('pre-shipped' or 'custom')
 * @returns ParseResult with prompt or error
 */
export function parsePromptFile(
  filePath: string,
  content: string,
  source: 'pre-shipped' | 'custom',
): ParseResult {
  try {
    // Parse front matter using gray-matter
    const parsed = matter(content);

    // Validate front matter structure
    if (!isPromptFrontMatter(parsed.data)) {
      return {
        success: false,
        error: {
          message: 'Invalid front matter structure',
          filePath,
          details: 'Front matter must contain name and description fields',
        },
      };
    }

    const frontMatter = parsed.data as PromptFrontMatter;

    // Extract content
    const promptContent = parsed.content.trim();
    if (!promptContent) {
      return {
        success: false,
        error: {
          message: 'Empty prompt content',
          filePath,
          details: 'Prompt must have non-empty markdown content',
        },
      };
    }

    // Build the prompt object
    const prompt: Prompt = {
      name: frontMatter.name,
      description: frontMatter.description,
      tags: frontMatter.tags || [],
      content: promptContent,
      ...(frontMatter.arguments && { arguments: frontMatter.arguments }),
      metadata: {
        filePath,
        source,
        loadedAt: new Date(),
      },
    };

    return {
      success: true,
      prompt,
    };
  } catch (error) {
    // Handle gray-matter parsing errors (usually YAML syntax errors)
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: {
        message: 'Failed to parse prompt file',
        filePath,
        details: message,
      },
    };
  }
}

/**
 * Parse multiple prompt files
 * Returns successful prompts and logs errors for failed ones
 */
export function parsePromptFiles(
  files: Array<{ path: string; content: string; source: 'pre-shipped' | 'custom' }>,
): { prompts: Prompt[]; errors: PromptParseError[] } {
  const prompts: Prompt[] = [];
  const errors: PromptParseError[] = [];

  for (const file of files) {
    const result = parsePromptFile(file.path, file.content, file.source);

    if (result.success && result.prompt) {
      prompts.push(result.prompt);
    } else if (result.error) {
      errors.push(
        new PromptParseError(result.error.message, result.error.filePath, result.error.details),
      );
    }
  }

  return { prompts, errors };
}

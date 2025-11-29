import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { PromptLoader } from '../../src/prompts/prompt-loader.js';
import { PromptValidationError } from '../../src/utils/errors.js';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/prompt-directory');

describe('PromptLoader', () => {
  describe('directoryExists()', () => {
    it('should return true for existing directory', async () => {
      const exists = await PromptLoader.directoryExists(FIXTURES_DIR);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent directory', async () => {
      const exists = await PromptLoader.directoryExists('/nonexistent/directory');
      expect(exists).toBe(false);
    });
  });

  describe('loadPromptFile()', () => {
    it('should load a valid prompt file', async () => {
      const filePath = path.join(FIXTURES_DIR, 'test-prompt-1.md');
      const prompt = await PromptLoader.loadPromptFile(filePath, 'custom');

      expect(prompt.name).toBe('test-prompt-1');
      expect(prompt.description).toBe('First test prompt');
      expect(prompt.tags).toEqual(['testing', 'example']);
      expect(prompt.content).toContain('Test Prompt 1');
      expect(prompt.metadata.source).toBe('custom');
      expect(prompt.metadata.filePath).toBe(filePath);
    });

    it('should throw validation error for invalid prompt', async () => {
      const filePath = path.join(FIXTURES_DIR, 'invalid-prompt.md');

      await expect(PromptLoader.loadPromptFile(filePath, 'custom')).rejects.toThrow(PromptValidationError);
    });
  });

  describe('loadFromDirectory()', () => {
    it('should load all valid prompts from directory', async () => {
      const result = await PromptLoader.loadFromDirectory(FIXTURES_DIR);

      // Should load at least one valid prompt
      expect(result.prompts.length).toBeGreaterThan(0);

      // Should have at least one error (invalid-prompt.md)
      expect(result.errors.length).toBeGreaterThan(0);

      // Check that valid prompt was loaded
      const validPrompt = result.prompts.find((p) => p.name === 'test-prompt-1');
      expect(validPrompt).toBeDefined();
      expect(validPrompt?.description).toBe('First test prompt');
    });

    it('should collect errors for invalid files', async () => {
      const result = await PromptLoader.loadFromDirectory(FIXTURES_DIR);

      // Should have error for invalid-prompt.md
      const invalidError = result.errors.find((e) => e.filePath.includes('invalid-prompt.md'));
      expect(invalidError).toBeDefined();
      expect(invalidError?.error).toBeInstanceOf(PromptValidationError);
    });
  });
});

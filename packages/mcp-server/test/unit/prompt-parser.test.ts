/**
 * Tests for prompt parser
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsePromptFile, parsePromptFiles } from '../../src/prompts/prompt-parser.js';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/prompts');

describe('parsePromptFile', () => {
  it('should parse valid prompt with all fields', () => {
    const content = readFileSync(join(FIXTURES_DIR, 'valid-prompt.md'), 'utf-8');
    const result = parsePromptFile('/test/valid-prompt.md', content, 'pre-shipped');

    expect(result.success).toBe(true);
    expect(result.prompt).toBeDefined();
    expect(result.prompt?.name).toBe('valid-prompt');
    expect(result.prompt?.description).toBe('A valid test prompt');
    expect(result.prompt?.tags).toEqual(['test', 'example']);
    expect(result.prompt?.arguments).toHaveLength(2);
    expect(result.prompt?.arguments?.[0]).toEqual({
      name: 'language',
      description: 'Programming language',
      required: true,
    });
    expect(result.prompt?.content).toContain('This is a valid prompt');
    expect(result.prompt?.metadata.filePath).toBe('/test/valid-prompt.md');
    expect(result.prompt?.metadata.source).toBe('pre-shipped');
  });

  it('should parse minimal prompt with only required fields', () => {
    const content = readFileSync(join(FIXTURES_DIR, 'minimal-prompt.md'), 'utf-8');
    const result = parsePromptFile('/test/minimal.md', content, 'custom');

    expect(result.success).toBe(true);
    expect(result.prompt).toBeDefined();
    expect(result.prompt?.name).toBe('minimal-prompt');
    expect(result.prompt?.description).toBe('Minimal prompt with only required fields');
    expect(result.prompt?.tags).toEqual([]);
    expect(result.prompt?.arguments).toBeUndefined();
    expect(result.prompt?.metadata.source).toBe('custom');
  });

  it('should fail for prompt with missing name', () => {
    const content = readFileSync(join(FIXTURES_DIR, 'invalid-missing-name.md'), 'utf-8');
    const result = parsePromptFile('/test/invalid.md', content, 'pre-shipped');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Invalid front matter');
    expect(result.error?.filePath).toBe('/test/invalid.md');
  });

  it('should fail for prompt with invalid YAML', () => {
    const content = readFileSync(join(FIXTURES_DIR, 'invalid-yaml.md'), 'utf-8');
    const result = parsePromptFile('/test/invalid-yaml.md', content, 'pre-shipped');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Failed to parse');
  });

  it('should fail for empty content', () => {
    const content = '---\nname: test\ndescription: Test\n---\n\n  \n';
    const result = parsePromptFile('/test/empty.md', content, 'pre-shipped');

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Empty prompt content');
  });

  it('should fail for missing front matter', () => {
    const content = 'Just some markdown without front matter';
    const result = parsePromptFile('/test/no-fm.md', content, 'pre-shipped');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('parsePromptFiles', () => {
  it('should parse multiple valid files', () => {
    const files = [
      {
        path: '/test/valid.md',
        content: readFileSync(join(FIXTURES_DIR, 'valid-prompt.md'), 'utf-8'),
        source: 'pre-shipped' as const,
      },
      {
        path: '/test/minimal.md',
        content: readFileSync(join(FIXTURES_DIR, 'minimal-prompt.md'), 'utf-8'),
        source: 'custom' as const,
      },
    ];

    const { prompts, errors } = parsePromptFiles(files);

    expect(prompts).toHaveLength(2);
    expect(errors).toHaveLength(0);
    expect(prompts[0]?.name).toBe('valid-prompt');
    expect(prompts[1]?.name).toBe('minimal-prompt');
  });

  it('should handle mix of valid and invalid files', () => {
    const files = [
      {
        path: '/test/valid.md',
        content: readFileSync(join(FIXTURES_DIR, 'valid-prompt.md'), 'utf-8'),
        source: 'pre-shipped' as const,
      },
      {
        path: '/test/invalid.md',
        content: readFileSync(join(FIXTURES_DIR, 'invalid-missing-name.md'), 'utf-8'),
        source: 'pre-shipped' as const,
      },
      {
        path: '/test/minimal.md',
        content: readFileSync(join(FIXTURES_DIR, 'minimal-prompt.md'), 'utf-8'),
        source: 'custom' as const,
      },
    ];

    const { prompts, errors } = parsePromptFiles(files);

    expect(prompts).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.filePath).toBe('/test/invalid.md');
  });

  it('should return empty arrays for no files', () => {
    const { prompts, errors } = parsePromptFiles([]);

    expect(prompts).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});

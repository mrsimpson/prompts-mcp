/**
 * Tests for prompt type definitions and type guards
 */

import { describe, it, expect } from 'vitest';
import {
  isPromptArgument,
  isPromptFrontMatter,
  type PromptArgument,
  type PromptFrontMatter,
} from '../../src/prompts/types.js';

describe('isPromptArgument', () => {
  it('should return true for valid prompt argument', () => {
    const validArg: PromptArgument = {
      name: 'language',
      description: 'Programming language',
      required: true,
    };
    expect(isPromptArgument(validArg)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isPromptArgument(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPromptArgument(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isPromptArgument('string')).toBe(false);
    expect(isPromptArgument(123)).toBe(false);
    expect(isPromptArgument(true)).toBe(false);
  });

  it('should return false for missing name', () => {
    const invalid = {
      description: 'desc',
      required: true,
    };
    expect(isPromptArgument(invalid)).toBe(false);
  });

  it('should return false for missing description', () => {
    const invalid = {
      name: 'test',
      required: true,
    };
    expect(isPromptArgument(invalid)).toBe(false);
  });

  it('should return false for missing required', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
    };
    expect(isPromptArgument(invalid)).toBe(false);
  });

  it('should return false for wrong name type', () => {
    const invalid = {
      name: 123,
      description: 'desc',
      required: true,
    };
    expect(isPromptArgument(invalid)).toBe(false);
  });

  it('should return false for wrong required type', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
      required: 'yes',
    };
    expect(isPromptArgument(invalid)).toBe(false);
  });
});

describe('isPromptFrontMatter', () => {
  it('should return true for valid minimal front matter', () => {
    const validFM: PromptFrontMatter = {
      name: 'test-prompt',
      description: 'Test description',
    };
    expect(isPromptFrontMatter(validFM)).toBe(true);
  });

  it('should return true for valid front matter with tags', () => {
    const validFM: PromptFrontMatter = {
      name: 'test-prompt',
      description: 'Test description',
      tags: ['tag1', 'tag2'],
    };
    expect(isPromptFrontMatter(validFM)).toBe(true);
  });

  it('should return true for valid front matter with arguments', () => {
    const validFM: PromptFrontMatter = {
      name: 'test-prompt',
      description: 'Test description',
      arguments: [
        { name: 'arg1', description: 'First arg', required: true },
        { name: 'arg2', description: 'Second arg', required: false },
      ],
    };
    expect(isPromptFrontMatter(validFM)).toBe(true);
  });

  it('should return true for valid front matter with all fields', () => {
    const validFM: PromptFrontMatter = {
      name: 'test-prompt',
      description: 'Test description',
      tags: ['tag1', 'tag2'],
      arguments: [{ name: 'arg1', description: 'First arg', required: true }],
    };
    expect(isPromptFrontMatter(validFM)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isPromptFrontMatter(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPromptFrontMatter(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isPromptFrontMatter('string')).toBe(false);
    expect(isPromptFrontMatter(123)).toBe(false);
  });

  it('should return false for missing name', () => {
    const invalid = {
      description: 'desc',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for empty name', () => {
    const invalid = {
      name: '',
      description: 'desc',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for missing description', () => {
    const invalid = {
      name: 'test',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for empty description', () => {
    const invalid = {
      name: 'test',
      description: '',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for non-array tags', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
      tags: 'not-an-array',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for tags with non-string elements', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
      tags: ['valid', 123, 'also-valid'],
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for non-array arguments', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
      arguments: 'not-an-array',
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should return false for arguments with invalid elements', () => {
    const invalid = {
      name: 'test',
      description: 'desc',
      arguments: [
        { name: 'valid', description: 'desc', required: true },
        { name: 'invalid', description: 'desc' }, // missing required
      ],
    };
    expect(isPromptFrontMatter(invalid)).toBe(false);
  });

  it('should accept additional fields (extensibility)', () => {
    const validFM = {
      name: 'test',
      description: 'desc',
      customField: 'value',
      anotherField: 123,
    };
    expect(isPromptFrontMatter(validFM)).toBe(true);
  });
});

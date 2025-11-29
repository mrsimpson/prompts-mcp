import { describe, it, expect } from 'vitest';
import { PromptLoader } from '../../src/prompts/prompt-loader.js';
import { resolve } from 'node:path';

describe('Pre-shipped Prompts', () => {
  it('should load all 5 pre-shipped prompts successfully', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    // Should have no errors
    expect(result.errors).toHaveLength(0);

    // Should have exactly 5 prompts
    expect(result.prompts).toHaveLength(5);

    // Check prompt names
    const promptNames = result.prompts.map((p) => p.name).sort();
    expect(promptNames).toEqual([
      'brainstorming',
      'code-review',
      'documentation',
      'meeting-notes',
      'refactoring',
    ]);
  });

  it('should have valid metadata for code-review prompt', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const codeReview = result.prompts.find((p) => p.name === 'code-review');
    expect(codeReview).toBeDefined();
    if (!codeReview) return;
    
    expect(codeReview.description).toContain('code review');
    expect(codeReview.tags).toContain('code');
    expect(codeReview.tags).toContain('review');
    expect(codeReview.arguments).toBeDefined();
    expect(codeReview.arguments).toHaveLength(3);
    if (codeReview.arguments) {
      expect(codeReview.arguments[0].name).toBe('code');
      expect(codeReview.arguments[0].required).toBe(true);
    }
  });

  it('should have valid metadata for documentation prompt', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const documentation = result.prompts.find((p) => p.name === 'documentation');
    expect(documentation).toBeDefined();
    if (!documentation) return;
    
    expect(documentation.description).toContain('documentation');
    expect(documentation.tags).toContain('documentation');
    expect(documentation.arguments).toHaveLength(4);
  });

  it('should have valid metadata for brainstorming prompt', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const brainstorming = result.prompts.find((p) => p.name === 'brainstorming');
    expect(brainstorming).toBeDefined();
    if (!brainstorming) return;
    
    expect(brainstorming.description).toContain('brainstorming');
    expect(brainstorming.tags).toContain('brainstorming');
    expect(brainstorming.arguments).toHaveLength(4);
  });

  it('should have valid metadata for meeting-notes prompt', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const meetingNotes = result.prompts.find((p) => p.name === 'meeting-notes');
    expect(meetingNotes).toBeDefined();
    if (!meetingNotes) return;
    
    expect(meetingNotes.description).toContain('meeting notes');
    expect(meetingNotes.tags).toContain('meeting');
    expect(meetingNotes.arguments).toHaveLength(4);
  });

  it('should have valid metadata for refactoring prompt', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const refactoring = result.prompts.find((p) => p.name === 'refactoring');
    expect(refactoring).toBeDefined();
    if (!refactoring) return;
    
    expect(refactoring.description).toContain('refactoring');
    expect(refactoring.tags).toContain('refactoring');
    expect(refactoring.arguments).toHaveLength(4);
  });

  it('should have non-empty content for all prompts', async () => {
    const promptsDir = resolve(process.cwd(), 'packages/mcp-server/resources/prompts');
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    result.prompts.forEach((prompt) => {
      expect(prompt.content.length).toBeGreaterThan(100);
      expect(prompt.content).toContain('#'); // Should have markdown headers
    });
  });
});

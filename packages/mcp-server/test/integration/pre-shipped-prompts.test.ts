import { describe, it, expect } from "vitest";
import { PromptLoader } from "../../src/prompts/prompt-loader.js";
import { resolve } from "node:path";

describe("Pre-shipped Prompts", () => {
  it("should load the create-prompt pre-shipped prompt successfully", async () => {
    const promptsDir = resolve(process.cwd(), "resources/prompts");
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    // Should have no errors
    expect(result.errors).toHaveLength(0);

    // Should have exactly 1 prompt
    expect(result.prompts).toHaveLength(1);

    // Check prompt name
    expect(result.prompts[0]?.name).toBe("create-prompt");
  });

  it("should have valid metadata for create-prompt", async () => {
    const promptsDir = resolve(process.cwd(), "resources/prompts");
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const createPrompt = result.prompts.find((p) => p.name === "create-prompt");
    expect(createPrompt).toBeDefined();
    if (!createPrompt) return;

    expect(createPrompt.description).toContain("MCP prompt files");
    expect(createPrompt.tags).toContain("meta");
    expect(createPrompt.tags).toContain("prompts");
    expect(createPrompt.arguments).toBeDefined();
    expect(createPrompt.arguments).toHaveLength(3);

    if (createPrompt.arguments && createPrompt.arguments.length > 0) {
      expect(createPrompt.arguments[0]?.name).toBe("purpose");
      expect(createPrompt.arguments[0]?.required).toBe(true);
      expect(createPrompt.arguments[1]?.name).toBe("target_audience");
      expect(createPrompt.arguments[1]?.required).toBe(false);
      expect(createPrompt.arguments[2]?.name).toBe("parameters");
      expect(createPrompt.arguments[2]?.required).toBe(false);
    }
  });

  it("should have comprehensive content for create-prompt", async () => {
    const promptsDir = resolve(process.cwd(), "resources/prompts");
    const result = await PromptLoader.loadFromDirectory(promptsDir);

    const createPrompt = result.prompts.find((p) => p.name === "create-prompt");
    expect(createPrompt).toBeDefined();
    if (!createPrompt) return;

    expect(createPrompt.content.length).toBeGreaterThan(500);
    expect(createPrompt.content).toContain("#"); // Should have markdown headers
    expect(createPrompt.content).toContain("Handlebars"); // Should mention template syntax
    expect(createPrompt.content).toContain("Front Matter"); // Should explain structure
    expect(createPrompt.content).toContain("Best Practices"); // Should include guidance
  });
});

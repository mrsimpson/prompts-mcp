import { describe, it, expect, beforeEach } from "vitest";
import { PromptManager } from "../../src/prompts/prompt-manager.js";
import { PromptNotFoundError } from "../../src/utils/errors.js";
import type { Prompt } from "../../src/prompts/types.js";

// Helper function to create test prompts
function createPrompt(
  name: string,
  source: "pre-shipped" | "custom" = "custom",
  tags: string[] = []
): Prompt {
  return {
    name,
    description: `Description for ${name}`,
    content: `Content for ${name}`,
    tags,
    metadata: {
      filePath: `/test/${name}.md`,
      source,
      loadedAt: new Date()
    }
  };
}

describe("PromptManager", () => {
  let manager: PromptManager;

  beforeEach(() => {
    manager = new PromptManager();
  });

  describe("register()", () => {
    it("should register a new prompt", () => {
      const prompt = createPrompt("test-prompt");
      manager.register(prompt);

      expect(manager.hasPrompt("test-prompt")).toBe(true);
      expect(manager.count()).toBe(1);
    });

    it("should allow registering multiple prompts", () => {
      manager.register(createPrompt("prompt-1"));
      manager.register(createPrompt("prompt-2"));
      manager.register(createPrompt("prompt-3"));

      expect(manager.count()).toBe(3);
    });

    it("should override existing prompt when allowed", () => {
      const prompt1 = createPrompt("test-prompt");
      const prompt2 = {
        ...createPrompt("test-prompt"),
        description: "Updated description"
      };

      manager.register(prompt1);
      manager.register(prompt2, true);

      const retrieved = manager.getPrompt("test-prompt");
      expect(retrieved.description).toBe("Updated description");
    });

    it("should not override when allowOverride is false", () => {
      const prompt1 = createPrompt("test-prompt");
      const prompt2 = {
        ...createPrompt("test-prompt"),
        description: "Updated description"
      };

      manager.register(prompt1);
      manager.register(prompt2, false);

      const retrieved = manager.getPrompt("test-prompt");
      expect(retrieved.description).toBe("Description for test-prompt");
    });

    it("should allow custom prompt to override pre-shipped prompt", () => {
      const preShipped = createPrompt("test-prompt", "pre-shipped");
      const custom = createPrompt("test-prompt", "custom");

      manager.register(preShipped);
      manager.register(custom);

      const retrieved = manager.getPrompt("test-prompt");
      expect(retrieved.metadata.source).toBe("custom");
    });

    it("should not allow pre-shipped to override custom prompt", () => {
      const custom = createPrompt("test-prompt", "custom");
      const preShipped = createPrompt("test-prompt", "pre-shipped");

      manager.register(custom);
      manager.register(preShipped);

      const retrieved = manager.getPrompt("test-prompt");
      expect(retrieved.metadata.source).toBe("custom");
    });
  });

  describe("registerMany()", () => {
    it("should register multiple prompts at once", () => {
      const prompts = [
        createPrompt("prompt-1"),
        createPrompt("prompt-2"),
        createPrompt("prompt-3")
      ];

      manager.registerMany(prompts);

      expect(manager.count()).toBe(3);
      expect(manager.hasPrompt("prompt-1")).toBe(true);
      expect(manager.hasPrompt("prompt-2")).toBe(true);
      expect(manager.hasPrompt("prompt-3")).toBe(true);
    });

    it("should handle empty array", () => {
      manager.registerMany([]);
      expect(manager.count()).toBe(0);
    });

    it("should apply precedence rules when registering many", () => {
      const prompts = [
        createPrompt("prompt-1", "pre-shipped"),
        createPrompt("prompt-1", "custom"), // Should override
        createPrompt("prompt-2", "custom")
      ];

      manager.registerMany(prompts);

      expect(manager.count()).toBe(2);
      expect(manager.getPrompt("prompt-1").metadata.source).toBe("custom");
    });
  });

  describe("getPrompt()", () => {
    it("should retrieve a registered prompt", () => {
      const prompt = createPrompt("test-prompt");
      manager.register(prompt);

      const retrieved = manager.getPrompt("test-prompt");
      expect(retrieved).toEqual(prompt);
    });

    it("should throw PromptNotFoundError for non-existent prompt", () => {
      expect(() => manager.getPrompt("non-existent")).toThrow(
        PromptNotFoundError
      );
    });

    it("should throw error with correct prompt name", () => {
      try {
        manager.getPrompt("missing-prompt");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(PromptNotFoundError);
        const promptError = error as PromptNotFoundError;
        expect(promptError.promptName).toBe("missing-prompt");
      }
    });
  });

  describe("hasPrompt()", () => {
    it("should return true for existing prompt", () => {
      manager.register(createPrompt("test-prompt"));
      expect(manager.hasPrompt("test-prompt")).toBe(true);
    });

    it("should return false for non-existent prompt", () => {
      expect(manager.hasPrompt("non-existent")).toBe(false);
    });
  });

  describe("listPrompts()", () => {
    it("should return empty array when no prompts registered", () => {
      expect(manager.listPrompts()).toEqual([]);
    });

    it("should return all registered prompts", () => {
      manager.register(createPrompt("prompt-1"));
      manager.register(createPrompt("prompt-2"));
      manager.register(createPrompt("prompt-3"));

      const prompts = manager.listPrompts();
      expect(prompts).toHaveLength(3);
      expect(prompts.map((p) => p.name)).toContain("prompt-1");
      expect(prompts.map((p) => p.name)).toContain("prompt-2");
      expect(prompts.map((p) => p.name)).toContain("prompt-3");
    });

    it("should return a new array (not internal reference)", () => {
      manager.register(createPrompt("prompt-1"));

      const list1 = manager.listPrompts();
      const list2 = manager.listPrompts();

      expect(list1).not.toBe(list2);
      expect(list1).toEqual(list2);
    });
  });

  describe("getPromptsByTag()", () => {
    it("should return prompts with specified tag", () => {
      manager.register(createPrompt("prompt-1", "custom", ["tag1", "tag2"]));
      manager.register(createPrompt("prompt-2", "custom", ["tag1"]));
      manager.register(createPrompt("prompt-3", "custom", ["tag3"]));

      const withTag1 = manager.getPromptsByTag("tag1");
      expect(withTag1).toHaveLength(2);
      expect(withTag1.map((p) => p.name)).toContain("prompt-1");
      expect(withTag1.map((p) => p.name)).toContain("prompt-2");
    });

    it("should return empty array for non-existent tag", () => {
      manager.register(createPrompt("prompt-1", "custom", ["tag1"]));

      const withTag2 = manager.getPromptsByTag("tag2");
      expect(withTag2).toHaveLength(0);
    });

    it("should return empty array when no prompts registered", () => {
      expect(manager.getPromptsByTag("any-tag")).toEqual([]);
    });
  });

  describe("getPromptsBySource()", () => {
    it("should return prompts from specified source", () => {
      manager.register(createPrompt("prompt-1", "pre-shipped"));
      manager.register(createPrompt("prompt-2", "custom"));
      manager.register(createPrompt("prompt-3", "pre-shipped"));

      const preShipped = manager.getPromptsBySource("pre-shipped");
      expect(preShipped).toHaveLength(2);
      expect(preShipped.map((p) => p.name)).toContain("prompt-1");
      expect(preShipped.map((p) => p.name)).toContain("prompt-3");

      const custom = manager.getPromptsBySource("custom");
      expect(custom).toHaveLength(1);
      expect(custom[0]?.name).toBe("prompt-2");
    });

    it("should return empty array when no prompts from source", () => {
      manager.register(createPrompt("prompt-1", "custom"));

      const preShipped = manager.getPromptsBySource("pre-shipped");
      expect(preShipped).toHaveLength(0);
    });
  });

  describe("clear()", () => {
    it("should remove all prompts", () => {
      manager.register(createPrompt("prompt-1"));
      manager.register(createPrompt("prompt-2"));

      expect(manager.count()).toBe(2);

      manager.clear();

      expect(manager.count()).toBe(0);
      expect(manager.listPrompts()).toEqual([]);
    });

    it("should work on empty manager", () => {
      expect(() => manager.clear()).not.toThrow();
      expect(manager.count()).toBe(0);
    });
  });

  describe("count()", () => {
    it("should return 0 for empty manager", () => {
      expect(manager.count()).toBe(0);
    });

    it("should return correct count after adding prompts", () => {
      manager.register(createPrompt("prompt-1"));
      expect(manager.count()).toBe(1);

      manager.register(createPrompt("prompt-2"));
      expect(manager.count()).toBe(2);

      manager.register(createPrompt("prompt-3"));
      expect(manager.count()).toBe(3);
    });

    it("should not increase count when registering duplicate name", () => {
      manager.register(createPrompt("prompt-1"));
      manager.register(createPrompt("prompt-1"));

      expect(manager.count()).toBe(1);
    });
  });

  describe("getAllTags()", () => {
    it("should return empty array when no prompts", () => {
      expect(manager.getAllTags()).toEqual([]);
    });

    it("should return all unique tags sorted", () => {
      manager.register(createPrompt("prompt-1", "custom", ["tag2", "tag1"]));
      manager.register(createPrompt("prompt-2", "custom", ["tag3", "tag1"]));
      manager.register(createPrompt("prompt-3", "custom", ["tag2"]));

      const tags = manager.getAllTags();
      expect(tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should not include duplicate tags", () => {
      manager.register(createPrompt("prompt-1", "custom", ["tag1", "tag2"]));
      manager.register(createPrompt("prompt-2", "custom", ["tag1", "tag2"]));

      const tags = manager.getAllTags();
      expect(tags).toEqual(["tag1", "tag2"]);
    });

    it("should handle prompts with no tags", () => {
      manager.register(createPrompt("prompt-1", "custom", []));
      manager.register(createPrompt("prompt-2", "custom", ["tag1"]));

      const tags = manager.getAllTags();
      expect(tags).toEqual(["tag1"]);
    });
  });

  describe("precedence rules", () => {
    it("should respect custom > pre-shipped precedence", () => {
      const preShipped = createPrompt("shared-prompt", "pre-shipped");
      const custom = createPrompt("shared-prompt", "custom");

      // Register pre-shipped first, then custom
      manager.register(preShipped);
      manager.register(custom);

      expect(manager.count()).toBe(1);
      expect(manager.getPrompt("shared-prompt").metadata.source).toBe("custom");

      // Clear and try opposite order
      manager.clear();

      manager.register(custom);
      manager.register(preShipped);

      expect(manager.count()).toBe(1);
      expect(manager.getPrompt("shared-prompt").metadata.source).toBe("custom");
    });

    it("should handle mixed sources correctly", () => {
      manager.register(createPrompt("prompt-1", "pre-shipped"));
      manager.register(createPrompt("prompt-2", "custom"));
      manager.register(createPrompt("prompt-3", "pre-shipped"));
      manager.register(createPrompt("prompt-1", "custom")); // Override prompt-1

      expect(manager.count()).toBe(3);
      expect(manager.getPrompt("prompt-1").metadata.source).toBe("custom");
      expect(manager.getPrompt("prompt-2").metadata.source).toBe("custom");
      expect(manager.getPrompt("prompt-3").metadata.source).toBe("pre-shipped");
    });
  });
});

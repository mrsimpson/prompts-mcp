import { describe, it, expect } from "vitest";
import { PromptValidator } from "../../src/prompts/prompt-validator.js";
import { PromptValidationError } from "../../src/utils/errors.js";
import type { Prompt } from "../../src/prompts/types.js";

describe("PromptValidator", () => {
  describe("validate()", () => {
    it("should validate a valid minimal prompt", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content"
      };

      expect(() => PromptValidator.validate(prompt, "test.md")).not.toThrow();
    });

    it("should validate a valid prompt with all fields", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["testing", "example"],
        arguments: [
          {
            name: "arg1",
            description: "First argument",
            required: true
          }
        ]
      };

      expect(() => PromptValidator.validate(prompt, "test.md")).not.toThrow();
    });

    it("should throw PromptValidationError for invalid prompt", () => {
      const prompt: Prompt = {
        name: "",
        description: "",
        content: "Test content"
      };

      expect(() => PromptValidator.validate(prompt, "test.md")).toThrow(
        PromptValidationError
      );
    });

    it("should include file path and errors in validation error", () => {
      const prompt: Prompt = {
        name: "",
        description: "",
        content: "Test content"
      };

      try {
        PromptValidator.validate(prompt, "test.md");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(PromptValidationError);
        const validationError = error as PromptValidationError;
        expect(validationError.filePath).toBe("test.md");
        expect(validationError.errors).toContain(
          "Prompt name cannot be empty or whitespace only"
        );
        expect(validationError.errors).toContain(
          "Prompt description cannot be empty or whitespace only"
        );
      }
    });
  });

  describe("validatePrompt()", () => {
    it("should return valid result for valid prompt", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid result with errors for invalid prompt", () => {
      const prompt: Prompt = {
        name: "",
        description: "",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("isValid()", () => {
    it("should return true for valid prompt", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content"
      };

      expect(PromptValidator.isValid(prompt)).toBe(true);
    });

    it("should return false for invalid prompt", () => {
      const prompt: Prompt = {
        name: "",
        description: "",
        content: "Test content"
      };

      expect(PromptValidator.isValid(prompt)).toBe(false);
    });
  });

  describe("name validation", () => {
    it("should reject missing name", () => {
      const prompt: Prompt = {
        name: "",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt name cannot be empty or whitespace only"
      );
    });

    it("should reject whitespace-only name", () => {
      const prompt: Prompt = {
        name: "   ",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt name cannot be empty or whitespace only"
      );
    });

    it("should reject name with invalid characters", () => {
      const prompt: Prompt = {
        name: "test prompt!",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt name must contain only alphanumeric characters, hyphens, and underscores"
      );
    });

    it("should accept name with hyphens and underscores", () => {
      const prompt: Prompt = {
        name: "test-prompt_123",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should reject name longer than 100 characters", () => {
      const prompt: Prompt = {
        name: "a".repeat(101),
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt name must be 100 characters or less"
      );
    });

    it("should accept name with exactly 100 characters", () => {
      const prompt: Prompt = {
        name: "a".repeat(100),
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });

  describe("description validation", () => {
    it("should reject missing description", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt description cannot be empty or whitespace only"
      );
    });

    it("should reject whitespace-only description", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "   ",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt description cannot be empty or whitespace only"
      );
    });

    it("should reject description longer than 500 characters", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "a".repeat(501),
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Prompt description must be 500 characters or less"
      );
    });

    it("should accept description with exactly 500 characters", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "a".repeat(500),
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept multi-line description", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "Line 1\nLine 2\nLine 3",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });

  describe("tags validation", () => {
    it("should accept undefined tags", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept empty tags array", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: []
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept valid tags", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["testing", "example", "demo"]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should reject non-array tags", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: "not-an-array"
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Prompt tags must be an array");
    });

    it("should reject non-string tags", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["valid", 123, "also-valid"]
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Each tag must be a string");
    });

    it("should reject empty string tags", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["valid", "", "also-valid"]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tags cannot be empty or whitespace only"
      );
    });

    it("should reject whitespace-only tags", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["valid", "   ", "also-valid"]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Tags cannot be empty or whitespace only"
      );
    });

    it("should reject tags longer than 50 characters", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["valid", "a".repeat(51)]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("must be 50 characters or less"))
      ).toBe(true);
    });

    it("should reject duplicate tags", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        tags: ["testing", "example", "testing"]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duplicate tags are not allowed");
    });
  });

  describe("arguments validation", () => {
    it("should accept undefined arguments", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept empty arguments array", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: []
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept valid arguments", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: "First argument",
            required: true
          },
          {
            name: "arg2",
            description: "Second argument",
            required: false
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should reject non-array arguments", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: "not-an-array"
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Prompt arguments must be an array");
    });

    it("should reject duplicate argument names", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: "First argument"
          },
          {
            name: "arg1",
            description: "Duplicate argument"
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duplicate argument name: arg1");
    });

    it("should reject argument without name", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            description: "Argument without name"
          }
        ]
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Argument name is required and must be a string"
      );
    });

    it("should reject argument with empty name", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "",
            description: "Argument with empty name"
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Argument name cannot be empty or whitespace only"
      );
    });

    it("should reject argument with name longer than 50 characters", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "a".repeat(51),
            description: "Argument with long name"
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("must be 50 characters or less"))
      ).toBe(true);
    });

    it("should reject argument without description", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1"
          }
        ]
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("Argument description is required")
        )
      ).toBe(true);
    });

    it("should reject argument with empty description", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: ""
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Argument description cannot be empty for argument: arg1"
      );
    });

    it("should reject argument with description longer than 200 characters", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: "a".repeat(201)
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("must be 200 characters or less"))
      ).toBe(true);
    });

    it("should reject argument with non-boolean required field", () => {
      const prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: "First argument",
            required: "yes"
          }
        ]
      } as unknown as Prompt;

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Argument 'required' field must be a boolean for argument: arg1"
      );
    });

    it("should accept argument without required field (defaults to false)", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "A test prompt",
        content: "Test content",
        arguments: [
          {
            name: "arg1",
            description: "First argument"
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple validation errors at once", () => {
      const prompt: Prompt = {
        name: "",
        description: "",
        content: "Test content",
        tags: ["", "valid"],
        arguments: [
          {
            name: "",
            description: ""
          }
        ]
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it("should handle special characters in name validation", () => {
      const testCases = [
        { name: "test@prompt", valid: false },
        { name: "test.prompt", valid: false },
        { name: "test prompt", valid: false },
        { name: "test-prompt", valid: true },
        { name: "test_prompt", valid: true },
        { name: "TestPrompt123", valid: true }
      ];

      for (const testCase of testCases) {
        const prompt: Prompt = {
          name: testCase.name,
          description: "A test prompt",
          content: "Test content"
        };

        const result = PromptValidator.validatePrompt(prompt);
        expect(result.valid).toBe(testCase.valid);
      }
    });

    it("should handle Unicode characters in description", () => {
      const prompt: Prompt = {
        name: "test-prompt",
        description: "Test prompt with émojis 🎉 and üñíçödé",
        content: "Test content"
      };

      const result = PromptValidator.validatePrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });
});

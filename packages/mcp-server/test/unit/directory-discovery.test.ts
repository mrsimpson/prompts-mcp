/**
 * Tests for directory discovery utility
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  discoverDirectory,
  findDirectory,
  directoryExists
} from "../../src/utils/directory-discovery.js";

describe("Directory Discovery", () => {
  let testRoot: string;
  let originalCwd: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original state
    originalCwd = process.cwd();
    originalEnv = { ...process.env };

    // Create unique test directory
    testRoot = join(tmpdir(), `dir-discovery-test-${Date.now()}`);
    mkdirSync(testRoot, { recursive: true });
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    process.env = originalEnv;

    // Clean up test directory
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  describe("discoverDirectory", () => {
    it("should find directory via environment variable", () => {
      const envDir = join(testRoot, "env-dir");
      mkdirSync(envDir, { recursive: true });
      process.env["TEST_SUBDIR"] = envDir;

      const result = discoverDirectory({
        subdirEnvPrefix: "TEST",
        subdir: ".test",
        startDir: testRoot
      });

      expect(result.source).toBe("env-subdir");
      expect(result.path).toBe(envDir);
      expect(result.exists).toBe(true);
    });

    it("should find directory in current directory", () => {
      const targetDir = join(testRoot, ".test");
      mkdirSync(targetDir, { recursive: true });

      const result = discoverDirectory({
        subdir: ".test",
        startDir: testRoot
      });

      expect(result.source).toBe("project");
      expect(result.path).toBe(targetDir);
      expect(result.exists).toBe(true);
    });

    it("should find directory in parent directory", () => {
      // Create structure: testRoot/.test and testRoot/subdir/subsubdir
      const targetDir = join(testRoot, ".test");
      mkdirSync(targetDir, { recursive: true });

      const nestedDir = join(testRoot, "subdir", "subsubdir");
      mkdirSync(nestedDir, { recursive: true });

      const result = discoverDirectory({
        subdir: ".test",
        startDir: nestedDir
      });

      expect(result.source).toBe("project");
      expect(result.path).toBe(targetDir);
      expect(result.exists).toBe(true);
    });

    it("should fall back to home directory when not found in project", () => {
      const result = discoverDirectory({
        subdir: ".nonexistent-test-dir",
        startDir: testRoot,
        useHomeFallback: true
      });

      expect(result.source).toBe("home");
      expect(result.path).toContain(".nonexistent-test-dir");
      // exists will be false unless user actually has this directory
    });

    it("should use custom home subdirectory when specified", () => {
      const result = discoverDirectory({
        subdir: ".project-dir",
        homeSubdir: ".home-dir",
        startDir: testRoot,
        useHomeFallback: true
      });

      expect(result.source).toBe("home");
      expect(result.path).toContain(".home-dir");
      expect(result.path).not.toContain(".project-dir");
    });

    it("should not fall back to home when disabled", () => {
      const result = discoverDirectory({
        subdir: ".nonexistent",
        startDir: testRoot,
        useHomeFallback: false
      });

      expect(result.source).toBe("project");
      expect(result.path).toBe(join(testRoot, ".nonexistent"));
      expect(result.exists).toBe(false);
    });

    it("should prioritize env var over project directory", () => {
      const envDir = join(testRoot, "env-dir");
      const projectDir = join(testRoot, ".test");

      mkdirSync(envDir, { recursive: true });
      mkdirSync(projectDir, { recursive: true });

      process.env["TEST_SUBDIR"] = envDir;

      const result = discoverDirectory({
        subdirEnvPrefix: "TEST",
        subdir: ".test",
        startDir: testRoot
      });

      expect(result.source).toBe("env-subdir");
      expect(result.path).toBe(envDir);
    });

    it("should prioritize project directory over home directory", () => {
      const projectDir = join(testRoot, ".test");
      mkdirSync(projectDir, { recursive: true });

      const result = discoverDirectory({
        subdir: ".test",
        startDir: testRoot,
        useHomeFallback: true
      });

      expect(result.source).toBe("project");
      expect(result.path).toBe(projectDir);
    });

    it("should handle nested subdirectories", () => {
      const targetDir = join(testRoot, ".config", "prompts");
      mkdirSync(targetDir, { recursive: true });

      const result = discoverDirectory({
        subdir: ".config/prompts",
        startDir: testRoot
      });

      expect(result.source).toBe("project");
      expect(result.path).toBe(targetDir);
      expect(result.exists).toBe(true);
    });

    it("should handle absolute paths in environment variable", () => {
      const absPath = resolve(testRoot, "absolute", "path");
      mkdirSync(absPath, { recursive: true });
      process.env["TEST_SUBDIR"] = absPath;

      const result = discoverDirectory({
        subdirEnvPrefix: "TEST",
        subdir: ".test",
        startDir: testRoot
      });

      expect(result.path).toBe(absPath);
      expect(result.exists).toBe(true);
    });

    it("should report exists: false when env var points to non-existent directory", () => {
      process.env["TEST_SUBDIR"] = "/nonexistent/path";

      const result = discoverDirectory({
        subdirEnvPrefix: "TEST",
        subdir: ".test",
        startDir: testRoot
      });

      expect(result.source).toBe("env-subdir");
      expect(result.exists).toBe(false);
    });
  });

  describe("findDirectory", () => {
    it("should return just the path", () => {
      const targetDir = join(testRoot, ".test");
      mkdirSync(targetDir, { recursive: true });

      const path = findDirectory({
        subdir: ".test",
        startDir: testRoot
      });

      expect(path).toBe(targetDir);
      expect(typeof path).toBe("string");
    });
  });

  describe("directoryExists", () => {
    it("should return true when directory exists", () => {
      const targetDir = join(testRoot, ".test");
      mkdirSync(targetDir, { recursive: true });

      const exists = directoryExists({
        subdir: ".test",
        startDir: testRoot
      });

      expect(exists).toBe(true);
    });

    it("should return false when directory does not exist", () => {
      const exists = directoryExists({
        subdir: ".nonexistent",
        startDir: testRoot,
        useHomeFallback: false
      });

      expect(exists).toBe(false);
    });
  });

  describe("Real-world usage patterns", () => {
    it("should work like prompts-mcp pattern", () => {
      // Simulate .prompts-mcp/prompts in project
      const promptsDir = join(testRoot, ".prompts-mcp", "prompts");
      mkdirSync(promptsDir, { recursive: true });

      const result = discoverDirectory({
        subdirEnvPrefix: "PROMPTS",
        subdir: ".prompts-mcp/prompts",
        startDir: testRoot,
        useHomeFallback: false
      });

      expect(result.path).toBe(promptsDir);
      expect(result.exists).toBe(true);
    });

    it("should work like knowledge-mcp pattern with PROJECT_DIR", () => {
      // Simulate .knowledge directory in parent
      const knowledgeDir = join(testRoot, ".knowledge");
      mkdirSync(knowledgeDir, { recursive: true });

      const nestedDir = join(testRoot, "packages", "api");
      mkdirSync(nestedDir, { recursive: true });

      // Set PROJECT_DIR to point to test root
      process.env["PROJECT_DIR"] = testRoot;

      const result = discoverDirectory({
        subdir: ".knowledge",
        startDir: nestedDir // This would normally be deep in project
      });

      expect(result.path).toBe(knowledgeDir);
      expect(result.exists).toBe(true);
      expect(result.source).toBe("env-project");
    });

    it("should work like quiet-shell-mcp pattern", () => {
      // Simulate .quiet-shell/config.yaml search
      const configDir = join(testRoot, ".quiet-shell");
      mkdirSync(configDir, { recursive: true });

      const deepDir = join(testRoot, "a", "b", "c");
      mkdirSync(deepDir, { recursive: true });

      const result = discoverDirectory({
        subdir: ".quiet-shell",
        startDir: deepDir,
        useHomeFallback: false
      });

      expect(result.path).toBe(configDir);
      expect(result.exists).toBe(true);
    });

    it("should work like responsible-vibe-mcp pattern with home fallback", () => {
      // When project path is invalid (like /), fall back to home
      const result = discoverDirectory({
        subdir: ".vibe",
        startDir: "/",
        useHomeFallback: true
      });

      expect(result.source).toBe("home");
      expect(result.path).toContain(".vibe");
    });
  });
});

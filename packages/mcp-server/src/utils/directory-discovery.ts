/**
 * Directory Discovery Utility
 *
 * A reusable utility for discovering configuration/data directories with fallback strategies.
 * Supports:
 * - Environment variable override for project directory (PROJECT_DIR)
 * - Environment variable override for subdirectory (PROMPTS_SUBDIR or custom)
 * - Upward search from current directory
 * - Home directory fallback
 *
 * This pattern is used across MCP servers (prompts-mcp, knowledge-mcp, quiet-shell-mcp, responsible-vibe-mcp)
 * to provide consistent directory resolution that works in both CLI and GUI-launched contexts.
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";

/**
 * Standard environment variable for overriding the project directory
 * When set, directory discovery starts from this path instead of process.cwd()
 */
export const PROJECT_DIR_ENV_VAR = "PROJECT_DIR";

/**
 * Standard environment variable for overriding the subdirectory path
 * When set, uses this directory directly instead of searching
 */
export const SUBDIR_ENV_VAR_SUFFIX = "_SUBDIR";

/**
 * Options for directory discovery
 */
export interface DirectoryDiscoveryOptions {
  /**
   * Name of environment variable to check for subdirectory override
   * @example "PROMPTS" - will check PROMPTS_SUBDIR environment variable
   * If not provided, no subdirectory env var override will be checked
   */
  subdirEnvPrefix?: string;

  /**
   * Subdirectory name to search for
   * @example ".prompt-mcp/prompts"
   */
  subdir: string;

  /**
   * Starting directory for upward search
   * Respects PROJECT_DIR environment variable if set
   * @default process.cwd()
   */
  startDir?: string;

  /**
   * Whether to fall back to home directory if not found
   * @default true
   */
  useHomeFallback?: boolean;

  /**
   * Custom home directory subdirectory (if different from main subdir)
   * @example ".prompt-mcp/prompts" (defaults to subdir if not specified)
   */
  homeSubdir?: string;
}

/**
 * Result of directory discovery with metadata about how it was found
 */
export interface DirectoryDiscoveryResult {
  /**
   * The resolved directory path
   */
  path: string;

  /**
   * How the directory was discovered
   */
  source: "env-subdir" | "env-project" | "project" | "home";

  /**
   * Whether the directory actually exists
   */
  exists: boolean;
}

/**
 * Get the starting directory, respecting PROJECT_DIR environment variable
 */
function getStartDirectory(providedStartDir?: string): string {
  // PROJECT_DIR env var takes precedence
  if (process.env[PROJECT_DIR_ENV_VAR]) {
    return resolve(process.env[PROJECT_DIR_ENV_VAR]!);
  }

  return providedStartDir ?? process.cwd();
}

/**
 * Search upward from a starting directory to find a subdirectory
 * @param startDir - Directory to start searching from
 * @param subdir - Subdirectory name to search for
 * @returns Path to found directory or null
 */
function searchUpward(startDir: string, subdir: string): string | null {
  let currentDir = resolve(startDir);
  const root = resolve("/");

  while (currentDir !== root) {
    const targetPath = resolve(currentDir, subdir);
    if (existsSync(targetPath)) {
      return targetPath;
    }
    currentDir = dirname(currentDir);
  }

  // Check root directory as well
  const rootPath = resolve(root, subdir);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  return null;
}

/**
 * Discover directory using multiple strategies with priority order:
 * 1. SUBDIR environment variable (e.g., PROMPTS_SUBDIR if subdirEnvPrefix="PROMPTS")
 * 2. PROJECT_DIR environment variable + upward search
 * 3. Upward search from process.cwd() or provided startDir
 * 4. Home directory fallback (if enabled)
 *
 * @param options - Discovery configuration options
 * @returns Discovery result with path and metadata
 *
 * @example
 * ```typescript
 * // Find .prompt-mcp/prompts directory
 * const result = discoverDirectory({
 *   subdirEnvPrefix: "PROMPTS",  // Checks PROMPTS_SUBDIR env var
 *   subdir: ".prompt-mcp/prompts"
 * });
 *
 * if (result.exists) {
 *   console.log(`Found prompts at: ${result.path} (source: ${result.source})`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Find .vibe directory with custom home fallback
 * const result = discoverDirectory({
 *   subdirEnvPrefix: "VIBE",
 *   subdir: ".vibe",
 *   homeSubdir: ".vibe",
 *   useHomeFallback: true
 * });
 * ```
 */
export function discoverDirectory(
  options: DirectoryDiscoveryOptions
): DirectoryDiscoveryResult {
  const {
    subdirEnvPrefix,
    subdir,
    startDir,
    useHomeFallback = true,
    homeSubdir = subdir
  } = options;

  // Strategy 1: SUBDIR environment variable override (highest priority)
  if (subdirEnvPrefix) {
    const subdirEnvVar = `${subdirEnvPrefix}${SUBDIR_ENV_VAR_SUFFIX}`;
    if (process.env[subdirEnvVar]) {
      const envPath = resolve(process.env[subdirEnvVar]!);
      return {
        path: envPath,
        source: "env-subdir",
        exists: existsSync(envPath)
      };
    }
  }

  // Get effective start directory (respects PROJECT_DIR)
  const effectiveStartDir = getStartDirectory(startDir);
  const usedProjectDirEnv = process.env[PROJECT_DIR_ENV_VAR] !== undefined;

  // Strategy 2: Search upward from effective start directory
  const projectPath = searchUpward(effectiveStartDir, subdir);
  if (projectPath) {
    return {
      path: projectPath,
      source: usedProjectDirEnv ? "env-project" : "project",
      exists: true // We know it exists because searchUpward found it
    };
  }

  // Strategy 3: Home directory fallback
  if (useHomeFallback) {
    const homePath = resolve(homedir(), homeSubdir);
    return {
      path: homePath,
      source: "home",
      exists: existsSync(homePath)
    };
  }

  // No fallback - return the subdir relative to startDir (doesn't exist)
  return {
    path: resolve(effectiveStartDir, subdir),
    source: usedProjectDirEnv ? "env-project" : "project",
    exists: false
  };
}

/**
 * Convenience function to get just the path (most common use case)
 * @param options - Discovery configuration options
 * @returns Resolved directory path
 */
export function findDirectory(options: DirectoryDiscoveryOptions): string {
  return discoverDirectory(options).path;
}

/**
 * Check if directory exists at any of the search locations
 * @param options - Discovery configuration options
 * @returns true if directory exists
 */
export function directoryExists(options: DirectoryDiscoveryOptions): boolean {
  return discoverDirectory(options).exists;
}

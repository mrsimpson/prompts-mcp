/**
 * Tests for configuration loading
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../../src/config/config.js";
import { ConfigurationError } from "../../src/utils/errors.js";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should load default configuration", () => {
    const config = loadConfig();
    expect(config).toEqual({
      serverName: "prompts-mcp-server",
      serverVersion: "1.0.0",
      httpPort: 3000,
      logLevel: "info",
      enableStdio: true,
      enableHttp: false
    });
  });

  it("should load custom prompts directory from env", () => {
    process.env["CUSTOM_PROMPTS_DIR"] = "/path/to/prompts";
    const config = loadConfig();
    expect(config.customPromptsDir).toBe("/path/to/prompts");
  });

  it("should load HTTP port from env", () => {
    process.env["HTTP_PORT"] = "8080";
    const config = loadConfig();
    expect(config.httpPort).toBe(8080);
  });

  it("should load log level from env", () => {
    process.env["LOG_LEVEL"] = "debug";
    const config = loadConfig();
    expect(config.logLevel).toBe("debug");
  });

  it("should throw error for invalid port", () => {
    process.env["HTTP_PORT"] = "99999";
    expect(() => loadConfig()).toThrow(ConfigurationError);
  });

  it("should throw error for invalid log level", () => {
    process.env["LOG_LEVEL"] = "invalid";
    expect(() => loadConfig()).toThrow(ConfigurationError);
  });

  it("should prioritize CLI config over env", () => {
    process.env["HTTP_PORT"] = "8080";
    const config = loadConfig({ httpPort: 9000 });
    expect(config.httpPort).toBe(9000);
  });

  it("should throw error when both transports disabled", () => {
    expect(() => loadConfig({ enableStdio: false, enableHttp: false })).toThrow(
      ConfigurationError
    );
    expect(() => loadConfig({ enableStdio: false, enableHttp: false })).toThrow(
      "At least one transport"
    );
  });

  it("should parse boolean environment variables", () => {
    process.env["ENABLE_HTTP"] = "true";
    const config = loadConfig();
    expect(config.enableHttp).toBe(true);
  });

  it("should handle various boolean formats", () => {
    process.env["ENABLE_HTTP"] = "1";
    let config = loadConfig();
    expect(config.enableHttp).toBe(true);

    process.env["ENABLE_HTTP"] = "yes";
    config = loadConfig();
    expect(config.enableHttp).toBe(true);

    process.env["ENABLE_HTTP"] = "false";
    config = loadConfig();
    expect(config.enableHttp).toBe(false);
  });
});

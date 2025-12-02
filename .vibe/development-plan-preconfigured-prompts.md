# Development Plan: prompts (preconfigured-prompts branch)

_Generated on 2025-11-30 by Vibe Feature MCP_
_Workflow: [epcc](https://mrsimpson.github.io/responsible-vibe-mcp/workflows/epcc)_

## Goal

Change the prompts directory source from a custom directory to `.prompts-mcp/prompts` to align with standard MCP conventions.

## Explore

### Tasks

- [x] Clarify user's requirements about `.prompts-mcp/prompts` directory
- [x] Understand if this should be a project-level or user-level directory
- [x] Determine if this replaces or complements existing directories
- [x] Assess backward compatibility requirements
- [x] Document all code locations that need changes
- [x] Identify test files that need updates

### Completed

- [x] Created development plan file
- [x] Examined current prompt loading implementation (index.ts)
- [x] Found current structure uses `resources/prompts` for pre-shipped prompts
- [x] Identified `customPromptsDir` config option for custom prompts
- [x] Confirmed `.prompt-mcp` directory does not currently exist
- [x] Clarified requirements with user

## Plan

### Phase Entrance Criteria:

- [x] Current implementation of prompt loading is understood
- [x] The desired directory structure (`.prompts-mcp/prompts`) is documented
- [x] Impact on existing configuration and code is assessed
- [x] User preferences regarding backward compatibility are clarified

### Tasks

- [x] Design the new "create-prompt" pre-shipped prompt
- [x] Plan the changes to configuration system (remove customPromptsDir)
- [x] Plan the changes to prompt loading logic
- [x] Define test strategy for the changes
- [x] Review edge cases and error handling

### Completed

- [x] Created detailed implementation plan with 5 parts
- [x] Identified all 10 files that need modification
- [x] Designed comprehensive "create-prompt" prompt to replace 5 example prompts
- [x] Documented edge cases and error handling strategy

## Code

### Phase Entrance Criteria:

- [x] Implementation plan is complete and approved
- [x] All code changes are identified and documented
- [x] Configuration changes are planned
- [x] Testing approach is defined

### Tasks

**Part 1: Configuration Changes**

- [x] Remove `customPromptsDir` from `src/config/types.ts`
- [x] Remove `CUSTOM_PROMPTS_DIR` loading from `src/config/env.ts`
- [x] Remove validation for `customPromptsDir` from `src/config/config.ts`

**Part 2: Prompt Loading Changes**

- [x] Update `src/index.ts` to load from `.prompts-mcp/prompts` in CWD
- [x] Add graceful handling for missing directory
- [x] Update logging messages

**Part 3: Replace Pre-shipped Prompts**

- [x] Delete 5 existing prompt files from `resources/prompts/`
- [x] Create new `resources/prompts/create-prompt.md`

**Part 4: Update Tests**

- [x] Update `test/unit/config.test.ts`
- [x] Update `test/integration/pre-shipped-prompts.test.ts`
- [x] Run all tests to verify changes (179 tests passed!)

**Part 5: Update Documentation**

- [x] Update `README.md`
- [x] Update `QUICKSTART.md`

### Completed

- [x] Removed `customPromptsDir` from configuration types, environment loading, and validation
- [x] Updated prompt loading to use `.prompts-mcp/prompts` in current working directory
- [x] Added graceful handling for missing directory with appropriate logging
- [x] Created comprehensive `create-prompt.md` pre-shipped prompt
- [x] Deleted 5 old example prompts (brainstorming, code-review, documentation, meeting-notes, refactoring)
- [x] Updated all tests (179 tests passed)
- [x] Updated README.md with new configuration and custom prompts section
- [x] Updated QUICKSTART.md to reflect new directory structure
- [x] Successfully built project with no errors
- [x] Verified type safety with TypeScript compiler

## Commit

### Phase Entrance Criteria:

- [x] All code changes are implemented
- [x] Tests pass successfully
- [x] Code has been tested manually
- [x] Documentation reflects the changes

### Tasks

- [x] Review code against development plan objectives
- [x] Check for workarounds and unnecessary backward compatibility
- [x] Validate code organization and maintainability
- [x] Rename `customPromptsDir` to `userPromptsDir` for clarity
- [x] Update documentation to use "user prompts" consistently
- [x] Build generic directory-discovery utility
- [x] Use PROJECT_DIR and PROMPTS_SUBDIR environment variables
- [x] Define USER_PROMPTS_SUBDIR constant
- [x] Update all tests to use new interface

### Completed

- [x] Comprehensive code review conducted
- [x] All objectives validated ✓
- [x] No workarounds or technical debt found ✓
- [x] Code organization excellent ✓
- [x] Renamed variables: `customPromptsDir` → `userPromptsDir`, `customResult` → `userPromptsResult`, `customDirExists` → `userPromptsDirExists`
- [x] Updated all documentation: "custom prompts" → "user prompts"
- [x] Created reusable directory-discovery utility with:
  - Support for PROJECT_DIR environment variable (sets starting directory)
  - Support for PROMPTS_SUBDIR environment variable (overrides subdirectory path)
  - Upward search from start directory
  - Home directory fallback
  - Generic interface usable by other MCP servers
- [x] All 197 tests passing
- [x] Build and typecheck successful
- [x] Constants file created for USER_PROMPTS_SUBDIR

## Key Decisions

### User Requirements (Clarified)

1. **Purpose**: Replace the custom prompts functionality (`CUSTOM_PROMPTS_DIR`)
2. **Location**: Current working directory where the server runs (e.g., `process.cwd()/.prompts-mcp/prompts`)
3. **Convention**: Not following an existing MCP standard, just a preferred directory structure
4. **Backward Compatibility**: NOT needed - can remove `customPromptsDir` completely

### Implementation Approach

- Remove `customPromptsDir` from config types and environment loading
- Change custom prompts loading to always look in `.prompts-mcp/prompts` relative to CWD
- Keep pre-shipped prompts in `resources/prompts` (unchanged)
- Custom prompts from `.prompts-mcp/prompts` should still override pre-shipped prompts

### New Pre-shipped Prompt Design

**Create a "create-prompt" prompt that helps users create new prompt files:**

- Name: `create-prompt`
- Purpose: Guide users through creating well-structured MCP prompt files
- Arguments:
  - `purpose`: What the prompt should accomplish (required)
  - `target_audience`: Who will use this prompt (optional)
  - `parameters`: What parameters/arguments the prompt should accept (optional)
- Output: Complete markdown file with proper front matter following MCP conventions
- Include examples of good prompt structure, Handlebars syntax, and best practices

**Remove existing 5 prompts** (brainstorming, code-review, documentation, meeting-notes, refactoring) as they are just examples

### Files to Modify

**Source Code:**

1. `src/config/types.ts` - Remove `customPromptsDir` from ServerConfig interface
2. `src/config/env.ts` - Remove `CUSTOM_PROMPTS_DIR` environment variable loading
3. `src/config/config.ts` - Remove validation for `customPromptsDir`
4. `src/index.ts` - Change to load from `.prompts-mcp/prompts` in CWD instead of config-based directory

**Tests:** 5. `test/unit/config.test.ts` - Update or remove test for CUSTOM_PROMPTS_DIR 6. `test/integration/pre-shipped-prompts.test.ts` - Update to test new create-prompt instead of 5 example prompts

**Documentation:** 7. `README.md` - Update documentation to reflect new directory 8. `QUICKSTART.md` - Update if it mentions custom prompts directory

### Detailed Implementation Plan

#### Part 1: Configuration Changes

1. **src/config/types.ts**: Remove `customPromptsDir?: string` from `ServerConfig` interface
2. **src/config/env.ts**: Remove the code that reads `CUSTOM_PROMPTS_DIR` environment variable
3. **src/config/config.ts**: Remove validation for `customPromptsDir`

#### Part 2: Prompt Loading Changes

4. **src/index.ts**:
   - Replace conditional loading based on `config.customPromptsDir`
   - Always attempt to load from `.prompts-mcp/prompts` in `process.cwd()`
   - Handle case where directory doesn't exist gracefully (not an error)
   - Log appropriate messages

#### Part 3: Replace Pre-shipped Prompts

5. **Delete**: All 5 existing prompt files in `resources/prompts/`
6. **Create**: New `resources/prompts/create-prompt.md` with comprehensive prompt creation guide

#### Part 4: Update Tests

7. **test/unit/config.test.ts**: Remove test case for `CUSTOM_PROMPTS_DIR` environment variable
8. **test/integration/pre-shipped-prompts.test.ts**: Update tests to expect 1 prompt (create-prompt) instead of 5

#### Part 5: Update Documentation

9. **README.md**:
   - Remove references to `CUSTOM_PROMPTS_DIR`
   - Add section explaining `.prompts-mcp/prompts` convention
   - Update examples and configuration table
10. **QUICKSTART.md**: Update any references to custom prompts directory

### Edge Cases & Error Handling

- **Directory doesn't exist**: Log info message, don't treat as error (users may not have custom prompts)
- **Directory exists but empty**: Same as above
- **Directory exists but has invalid prompts**: Log warnings for each invalid prompt but continue loading valid ones
- **Permission issues**: Log error but don't crash the server
- **Relative paths**: Always use `process.cwd()` as base, ensure path resolution is correct

## Notes

_Additional context and observations_

---

_This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on._

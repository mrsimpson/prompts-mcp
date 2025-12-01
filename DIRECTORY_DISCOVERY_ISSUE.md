# Directory Discovery Issue for MCP Servers

## Problem Statement

MCP servers that use `process.cwd()` to find configuration/data directories fail when launched from GUI applications (Claude Desktop, VS Code, etc.) because `process.cwd()` returns unexpected paths:

- **Claude Desktop on macOS**: CWD = `/Applications` or similar system directory
- **VS Code on macOS**: CWD = `/Applications/Visual Studio Code.app/Contents/Resources/app`
- **Other GUI launchers**: Unpredictable working directories

This makes it impossible for users to use project-specific or user-specific configuration directories.

## Solution: Directory Discovery Utility

A reusable directory discovery utility has been created in **prompts-mcp** that solves this problem with a flexible search strategy.

## Affected Repositories

1. **responsible-vibe-mcp** - Uses `.vibe/` directory
2. **knowledge-mcp** - Uses `.knowledge/` directory
3. **quiet-shell-mcp** - Uses `.quiet-shell/` directory
4. **agentic-knowledge** - Uses `.knowledge/` directory (if separate)

## How to Copy the Solution

### Step 1: Copy the Directory Discovery Utility

Copy this file from `prompts-mcp`:

```
packages/mcp-server/src/utils/directory-discovery.ts
```

To your MCP server:

```
packages/[your-package]/src/utils/directory-discovery.ts
```

**File location**: https://github.com/[your-org]/prompts-mcp/blob/main/packages/mcp-server/src/utils/directory-discovery.ts

### Step 2: Copy the Tests

Copy the test file:

```
packages/mcp-server/test/unit/directory-discovery.test.ts
```

To:

```
packages/[your-package]/test/unit/directory-discovery.test.ts
```

### Step 3: Define Your Constants

Create or update your constants file with your subdirectory:

```typescript
// src/constants.ts or similar
export const CONFIG_SUBDIR = ".vibe"; // or ".knowledge", ".quiet-shell", etc.
```

### Step 4: Update Your Main Entry Point

Replace code that uses `process.cwd()` directly with the discovery utility:

**Before:**

```typescript
const configDir = join(process.cwd(), ".vibe");
const configExists = existsSync(configDir);
```

**After:**

```typescript
import { discoverDirectory } from "./utils/directory-discovery.js";
import { CONFIG_SUBDIR } from "./constants.js";

const configDiscovery = discoverDirectory({
  subdirEnvPrefix: "VIBE", // Creates VIBE_SUBDIR env var
  subdir: CONFIG_SUBDIR,
  useHomeFallback: true
});

// Use configDiscovery.path for the directory
// Check configDiscovery.exists to see if it exists
// Check configDiscovery.source to see how it was found
```

### Step 5: Update Tests

Update your existing tests to use the new discovery utility and add tests for the discovery itself.

## Environment Variables Created

The utility automatically supports these environment variables:

1. **`PROJECT_DIR`** - Override the starting directory for upward search
   - Example: `PROJECT_DIR=/my/project npm start`
2. **`[PREFIX]_SUBDIR`** - Directly override the subdirectory path
   - Example for prompts: `PROMPTS_SUBDIR=/custom/path npm start`
   - Example for vibe: `VIBE_SUBDIR=/custom/path npm start`
   - Example for knowledge: `KNOWLEDGE_SUBDIR=/custom/path npm start`

## Search Strategy (Priority Order)

The utility searches in this order:

1. **`[PREFIX]_SUBDIR` environment variable** (highest priority - direct override)
2. **Upward search from `PROJECT_DIR`** (if PROJECT_DIR env var is set)
3. **Upward search from `process.cwd()`** (searches parent directories)
4. **Home directory fallback** (`~/.vibe/`, `~/.knowledge/`, etc.)

## Benefits

✅ **Solves GUI-launch problem** - Works with Claude Desktop and other GUI apps  
✅ **Project-aware** - Searches upward from nested directories  
✅ **User-specific fallback** - Uses home directory when no project config found  
✅ **Flexible override** - Two levels of environment variable control  
✅ **Zero breaking changes** - Maintains backward compatibility with CWD-based usage  
✅ **Well-tested** - Comprehensive test suite with real-world patterns

## Example Implementation

See the complete implementation in **prompts-mcp**:

- Commit: [commit hash]
- Files changed: 17
- Tests added: 18
- All tests passing: 197/197

## Testing Your Implementation

After copying, verify with these test cases:

1. **CLI usage**: Run from nested project directory - should find config in parent
2. **GUI launch**: Set `PROJECT_DIR` to simulate GUI launch - should work correctly
3. **Home fallback**: Run without project config - should use home directory
4. **Direct override**: Set `[PREFIX]_SUBDIR` - should use exact path

## Migration Checklist

- [ ] Copy `directory-discovery.ts` utility
- [ ] Copy `directory-discovery.test.ts` tests
- [ ] Define subdirectory constant
- [ ] Update main entry point to use discovery
- [ ] Update existing tests
- [ ] Run full test suite
- [ ] Test with GUI launcher (Claude Desktop)
- [ ] Update documentation with new environment variables
- [ ] Add migration notes for users (if breaking changes)

## Questions?

Refer to the implementation in `prompts-mcp` or ask for clarification on specific integration steps.

## Related Issues

- Original issue: [link if exists]
- Implementation PR: [link to prompts-mcp PR]

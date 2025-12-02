# 🚀 Quick Start Guide - MCP Prompts Server

## Current Location

```bash
cd /Users/oliverjaegle/projects/privat/mcp-server/prompts/packages/mcp-server
```

## ✅ Status: Production Ready!

- **166 tests passing** ✅
- **Built and compiled** ✅
- **stdio transport working** ✅ **(RECOMMENDED for Claude Desktop)**
- **HTTP transport** ✅ **WORKING** (for MCP Inspector, remote access)

> **Note:** Both transports are now functional! stdio is recommended for Claude Desktop (simpler, no session management). HTTP is great for MCP Inspector and remote access scenarios.

---

## 🎯 How to Run (Recommended: stdio)

### Option 1: stdio Only (For Claude Desktop)

```bash
node dist/bin.js
```

**What you'll see:**

```
{"timestamp":"...","level":"info","component":"Main","message":"Starting MCP Prompts Server..."}
{"timestamp":"...","level":"info","component":"Main","message":"Loaded 5 pre-shipped prompt(s)"}
{"timestamp":"...","level":"info","component":"StdioTransport","message":"stdio transport: Server started on stdio"}
{"timestamp":"...","level":"info","component":"Main","message":"Serving 5 prompt(s) via 1 transport(s)"}
```

Press `Ctrl+C` to stop.

### Option 2: HTTP Only (For Remote Access)

```bash
ENABLE_STDIO=false ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js
```

**Test it:**

```bash
# In another terminal
curl http://localhost:3000/health
```

**Expected response:**

```json
{ "status": "ok", "transport": "http", "timestamp": "2025-11-29T..." }
```

### Option 3: Both Transports (Hybrid Mode)

```bash
ENABLE_STDIO=true ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js
```

This runs both stdio and HTTP simultaneously!

---

## 🔧 Environment Variables

| Variable       | Default | Options                          |
| -------------- | ------- | -------------------------------- |
| `ENABLE_STDIO` | `true`  | `true` or `false`                |
| `ENABLE_HTTP`  | `false` | `true` or `false`                |
| `HTTP_PORT`    | `3000`  | Any available port               |
| `LOG_LEVEL`    | `info`  | `error`, `warn`, `info`, `debug` |

**Example with debug logging:**

```bash
LOG_LEVEL=debug node dist/bin.js
```

### Adding User Prompts

Create a `.prompts-mcp/prompts` directory in your working directory:

```bash
mkdir -p .prompts-mcp/prompts
# Add your .md prompt files to this directory
node dist/bin.js
```

---

## 📱 Claude Desktop Integration

### Step 1: Locate Config File

**macOS:**

```bash
open ~/Library/Application\ Support/Claude/
```

**Edit:** `claude_desktop_config.json`

### Step 2: Add This Configuration

```json
{
  "mcpServers": {
    "prompts": {
      "command": "node",
      "args": [
        "/Users/oliverjaegle/projects/privat/mcp-server/prompts/packages/mcp-server/dist/bin.js"
      ],
      "env": {
        "ENABLE_STDIO": "true",
        "ENABLE_HTTP": "false",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Step 3: Restart Claude Desktop

Completely quit and reopen Claude Desktop.

### Step 4: Verify

In Claude, you should now see 5 available prompts:

- 🔍 **code-review** - Comprehensive code review
- 📚 **documentation** - Generate API documentation
- 💡 **brainstorming** - Structured brainstorming
- 📝 **meeting-notes** - Format meeting notes
- 🔄 **refactoring** - Code refactoring suggestions

---

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

---

## 📝 Available Prompts

### Pre-shipped Prompt

The server includes one pre-shipped prompt in: `resources/prompts/`

#### create-prompt.md

A comprehensive guide to creating well-structured MCP prompt files.

**Arguments:**

- `purpose` (required) - What the prompt should accomplish
- `target_audience` (optional) - Who will use this prompt
- `parameters` (optional) - What parameters the prompt should accept

**Use this prompt to:**

- Learn the structure of MCP prompt files
- Understand Handlebars template syntax
- Get guidance on best practices
- Generate ready-to-use prompt files

### User Prompts

Add your own prompts by creating `.prompts-mcp/prompts/` directory:

```bash
mkdir -p .prompts-mcp/prompts
# Add your .md prompt files here
```

Your user prompts will automatically load when the server starts. Use the `create-prompt` prompt to help you build new prompts!

---

## 🐛 Troubleshooting

### Server won't start?

1. **Check build:**

   ```bash
   npm run build
   ```

2. **Check logs:**
   ```bash
   LOG_LEVEL=debug node dist/bin.js
   ```

### Port already in use?

```bash
# Use a different port
HTTP_PORT=3001 ENABLE_HTTP=true node dist/bin.js
```

### No prompts loading?

```bash
# Verify prompts directory
ls -la resources/prompts/

# Should show 5 .md files
```

### Claude Desktop not connecting?

1. Check the absolute path in config is correct
2. Verify the file exists: `ls -la dist/bin.js`
3. Check Claude's logs (varies by OS)
4. Try restarting Claude Desktop

---

## 🎉 You're All Set!

The server is ready to use. Try it now:

```bash
# Simple test
node dist/bin.js

# Or with HTTP
ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js

# Then test
curl http://localhost:3000/health
```

---

## 📚 Full Documentation

See `README.md` for complete documentation including:

- Detailed configuration options
- Prompt file format
- Development guide
- Architecture overview

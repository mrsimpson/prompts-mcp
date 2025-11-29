# 🚀 Quick Start Guide - MCP Prompts Server

## Current Location
```bash
cd /Users/oliverjaegle/projects/privat/mcp-server/prompts/packages/mcp-server
```

## ✅ Status: Ready to Use!
- **166 tests passing** ✅
- **Built and compiled** ✅
- **HTTP transport working** ✅
- **stdio transport working** ✅

---

## 🎯 How to Run

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
{"status":"ok","transport":"http","timestamp":"2025-11-29T..."}
```

### Option 3: Both Transports (Hybrid Mode)

```bash
ENABLE_STDIO=true ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js
```

This runs both stdio and HTTP simultaneously!

---

## 🔧 Environment Variables

| Variable | Default | Options |
|----------|---------|---------|
| `ENABLE_STDIO` | `true` | `true` or `false` |
| `ENABLE_HTTP` | `false` | `true` or `false` |
| `HTTP_PORT` | `3000` | Any available port |
| `LOG_LEVEL` | `info` | `error`, `warn`, `info`, `debug` |
| `CUSTOM_PROMPTS_DIR` | - | Path to your prompt directory |

**Example with custom prompts:**
```bash
CUSTOM_PROMPTS_DIR=/path/to/your/prompts LOG_LEVEL=debug node dist/bin.js
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

All prompts are in: `resources/prompts/`

### 1. code-review.md
Review code with detailed feedback on quality, bugs, and best practices.

**Arguments:**
- `code` (required) - Code to review
- `language` (optional) - Programming language
- `context` (optional) - Additional context

### 2. documentation.md
Generate comprehensive API documentation.

**Arguments:**
- `code` (required) - Code to document
- `format` (optional) - Documentation format
- `audience` (optional) - Target audience
- `includeExamples` (optional) - Include examples

### 3. brainstorming.md
Facilitate structured brainstorming sessions.

**Arguments:**
- `topic` (required) - Topic to brainstorm
- `context` (optional) - Background information
- `constraints` (optional) - Any constraints
- `participants` (optional) - Participant count

### 4. meeting-notes.md
Format and structure meeting notes.

**Arguments:**
- `notes` (required) - Raw meeting notes
- `format` (optional) - Output format
- `attendees` (optional) - Meeting attendees
- `date` (optional) - Meeting date

### 5. refactoring.md
Suggest code refactoring improvements.

**Arguments:**
- `code` (required) - Code to refactor
- `goals` (optional) - Refactoring goals
- `constraints` (optional) - Constraints
- `language` (optional) - Programming language

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

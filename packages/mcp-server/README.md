# MCP Prompts Server

A Model Context Protocol (MCP) server that exposes prompts defined in markdown files via stdio and HTTP transports.

## Features

- 📝 **Markdown-based prompts** with YAML/JSON front matter
- 🔌 **Dual transport support**: stdio (local) and HTTP (remote)
- 🎯 **Pre-shipped prompts** included out of the box
- 🎨 **Custom prompts** from your own directory
- 🔒 **Type-safe** with full TypeScript support
- ⚡ **Lightweight** and fast

## Installation

### From source (development)

```bash
# Clone the repository
git clone <your-repo-url>
cd mcp-server/prompts/packages/mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## Running the Server

### Option 1: stdio Transport (Local)

The stdio transport is ideal for local development with MCP clients like Claude Desktop.

```bash
# Using Node.js directly
node dist/bin.js

# Or with npm script (if configured)
npm start
```

**Configuration via environment variables:**

```bash
# Enable only stdio (default)
ENABLE_STDIO=true ENABLE_HTTP=false node dist/bin.js

# Set log level
LOG_LEVEL=debug node dist/bin.js

# Use custom prompts directory
CUSTOM_PROMPTS_DIR=/path/to/your/prompts node dist/bin.js
```

### Option 2: HTTP Transport (Remote)

The HTTP transport allows remote access to the server over HTTP.

```bash
# Enable HTTP on port 3000
ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js

# Enable both stdio and HTTP
ENABLE_STDIO=true ENABLE_HTTP=true HTTP_PORT=3000 node dist/bin.js
```

**HTTP Endpoints:**

- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check endpoint

**Example health check:**

```bash
curl http://localhost:3000/health
# {"status":"ok","transport":"http","timestamp":"2025-11-29T..."}
```

## Configuration

The server can be configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_NAME` | Server name for MCP identification | `mcp-prompts-server` |
| `SERVER_VERSION` | Server version | `0.1.0` |
| `CUSTOM_PROMPTS_DIR` | Path to custom prompts directory | `undefined` |
| `HTTP_PORT` | HTTP server port | `3000` |
| `LOG_LEVEL` | Logging level: `error`, `warn`, `info`, `debug` | `info` |
| `ENABLE_STDIO` | Enable stdio transport | `true` |
| `ENABLE_HTTP` | Enable HTTP transport | `false` |

## Prompt File Format

Prompts are defined in markdown files with YAML or JSON front matter:

```markdown
---
name: code-review
description: Perform a comprehensive code review
tags:
  - code
  - review
arguments:
  - name: code
    description: The code to review
    required: true
  - name: language
    description: Programming language
    required: false
---

Please review the following {{language}} code:

\`\`\`
{{code}}
\`\`\`

Provide feedback on:
1. Code quality and style
2. Potential bugs or issues
3. Performance optimizations
4. Best practices
```

### Front Matter Fields

- **name** (required): Unique identifier for the prompt
- **description** (required): Human-readable description
- **tags** (optional): Array of categorization tags
- **arguments** (optional): Array of prompt arguments
  - **name**: Argument identifier
  - **description**: Argument description
  - **required**: Boolean indicating if argument is required

## Pre-shipped Prompts

The server comes with 5 example prompts:

1. **code-review** - Comprehensive code review
2. **documentation** - Generate API documentation
3. **brainstorming** - Structured brainstorming sessions
4. **meeting-notes** - Format meeting notes
5. **refactoring** - Code refactoring suggestions

## Using with Claude Desktop

To use with Claude Desktop, add this server to your Claude configuration:

**For stdio transport:**

```json
{
  "mcpServers": {
    "prompts": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/prompts/packages/mcp-server/dist/bin.js"],
      "env": {
        "ENABLE_STDIO": "true",
        "ENABLE_HTTP": "false",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Location of Claude config file:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

After updating the config, restart Claude Desktop.

## Development

### Project Structure

```
packages/mcp-server/
├── src/
│   ├── bin.ts                  # CLI entry point
│   ├── index.ts                # Main server orchestration
│   ├── config/                 # Configuration management
│   ├── prompts/                # Prompt loading & management
│   ├── server/                 # MCP server factory
│   ├── transports/             # stdio & HTTP transports
│   └── utils/                  # Utilities (logger, errors)
├── resources/
│   └── prompts/                # Pre-shipped prompts
├── test/
│   ├── integration/            # Integration tests
│   └── unit/                   # Unit tests
└── dist/                       # Compiled output
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Run type checker
npm run typecheck
```

### Building

```bash
# Clean and build
npm run clean:build && npm run build

# Build only
npm run build
```

## Troubleshooting

### Server won't start

1. Check that at least one transport is enabled:
   ```bash
   ENABLE_STDIO=true node dist/bin.js
   ```

2. Check logs for errors:
   ```bash
   LOG_LEVEL=debug node dist/bin.js
   ```

### No prompts available

1. Verify pre-shipped prompts directory exists:
   ```bash
   ls resources/prompts/
   ```

2. If using custom prompts, verify the directory path:
   ```bash
   CUSTOM_PROMPTS_DIR=/path/to/prompts LOG_LEVEL=debug node dist/bin.js
   ```

### HTTP port already in use

Change the port number:
```bash
HTTP_PORT=3001 ENABLE_HTTP=true node dist/bin.js
```

## License

MIT

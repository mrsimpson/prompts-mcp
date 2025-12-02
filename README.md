# Prompts MCP Server

> **Prompts as Code** – Treat your prompts like you treat your code: structured, parameterized, versioned, and reusable.

[![License](https://img.shields.io/github/license/mrsimpson/prompts-mcp.svg?style=for-the-badge)](LICENSE)

---

## Why Prompts as Code?

As software engineers, we follow a simple principle:

> **If you repeat the same action three times, build a template.**

The craftsman's principle. From ad-hoc to systematic. From repetition to tooling. And ultimately:

**Repetition → Tooling → Quality**

This applies to prompts too. Whether it's code reviews, test generation, or documentation cleanup – we repeat the same prompt structures with different contexts. Instead of retyping or copy-pasting variations, we can parametrize them.

### The Dilemma

Prompts are often either:

- **Too simple** – providing little value beyond basic instructions
- **Too detailed** – requiring constant adaptation for each context, making them hard to reuse

### The Solution

**Parametrize your prompts** – just like you extract variables from code:

```markdown
---
name: code-review
description: Perform a code review with specific focus areas
arguments:
  - name: code
    description: The code to review
    required: true
  - name: focus
    description: Specific aspects to focus on (e.g., "performance", "security")
    required: false
---

Review the following code:

\`\`\`
{{code}}
\`\`\`

{{#if focus}}
Focus specifically on: {{focus}}
{{/if}}

Provide feedback on:

1. Code quality and maintainability
2. Potential bugs or issues
3. Performance considerations
4. Best practices
```

The structure stays stable. The **variable parts** (`{{code}}`, `{{focus}}`) are parameterized.

### Why This Matters

🔄 **Reusability through Variables**  
One prompt, many contexts. Parameterize the variable parts instead of rewriting for every use case.

📦 **Version Control**  
Prompts live in your **Git repository**, not lost in chat history. Review, iterate, and rollback – like any other code.

🔧 **Quality**  
When a prompt works better, refine it. When it degrades, roll back. Continuous improvement, just like code.

👥 **Team Sharing**  
Share your best prompts with your team – not as screenshots or copy-paste, but as **structured, documented artifacts**.

---

## Features

- 📝 **Markdown-based prompts** with YAML/JSON front matter
- 🎨 **Handlebars templating** for parameter substitution and conditionals
- 🔌 **Dual transport support**: stdio (local) and HTTP (remote)
- 🎯 **Pre-shipped prompts** including `create-prompt` to help you build new prompts
- 🔒 **Type-safe** with full TypeScript support
- ⚡ **Lightweight** and fast
- 🔄 **Hot-reload** user prompts from `.prompts-mcp/prompts`

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/mrsimpson/prompts-mcp.git
cd prompts-mcp/packages/mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run the server (stdio transport for Claude Desktop)
node dist/bin.js
```

### Configure Claude Desktop

Add to your Claude config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prompts": {
      "command": "node",
      "args": ["/absolute/path/to/prompts-mcp/packages/mcp-server/dist/bin.js"],
      "env": {
        "ENABLE_STDIO": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Restart Claude Desktop, and you're ready to use your prompts!

### Create Your First Prompt

1. Create a `.prompts-mcp/prompts` directory in your project:

   ```bash
   mkdir -p .prompts-mcp/prompts
   ```

2. Add a prompt file (e.g., `my-prompt.md`):

   ```markdown
   ---
   name: my-first-prompt
   description: A simple greeting prompt
   arguments:
     - name: name
       description: The name to greet
       required: true
   ---

   Hello {{name}}! Welcome to prompts-as-code.
   ```

3. Restart the server to load your new prompt

---

## How It Works

1. **Define prompts** as Markdown files with YAML front matter
2. **Parameterize** variable parts using Handlebars syntax (`{{variable}}`)
3. **Store prompts** in `.prompts-mcp/prompts` or use pre-shipped ones
4. **Invoke prompts** from your MCP client (e.g., Claude Desktop)
5. **Parameters are substituted** server-side before sending to the client

The server handles template rendering, validation, and transport – you just focus on writing great prompts.

---

## User Guide

For detailed documentation, see:

📚 **[Complete User Guide](packages/mcp-server/README.md)** – Full documentation including:

- Detailed configuration options
- Prompt file format and Handlebars syntax
- Running with stdio and HTTP transports
- Pre-shipped prompts reference
- Development guide
- Troubleshooting

🚀 **[Quick Start Guide](packages/mcp-server/QUICKSTART.md)** – Get up and running in minutes

---

## Example: Code Review Prompt

Here's a practical example of a reusable code review prompt:

```markdown
---
name: code-review
description: Perform a comprehensive code review
arguments:
  - name: code
    description: The code to review
    required: true
  - name: language
    description: Programming language (e.g., "TypeScript", "Python")
    required: false
  - name: focus
    description: Specific review focus (e.g., "performance", "security")
    required: false
---

Please review the following {{language}} code:

\`\`\`
{{code}}
\`\`\`

{{#if focus}}
Focus specifically on: {{focus}}
{{/if}}

Provide feedback on:

1. Code quality and style
2. Potential bugs or issues
3. Performance optimizations
4. Best practices
```

**Usage:**

- Invoke `code-review` with `code` parameter
- Optionally specify `language` and `focus`
- Get consistent, structured code reviews

---

## Pre-shipped Prompts

The server includes **`create-prompt`** – a meta-prompt that helps you create new prompts:

```markdown
Arguments:

- purpose: What the prompt should accomplish
- target_audience: Who will use this prompt (optional)
- parameters: What parameters the prompt should accept (optional)
```

Use `create-prompt` to learn the structure and generate ready-to-use prompt files!

---

## Architecture

```
prompts-mcp/
├── packages/
│   └── mcp-server/
│       ├── src/
│       │   ├── prompts/        # Prompt loading & validation
│       │   ├── server/          # MCP server factory
│       │   ├── transports/      # stdio & HTTP transports
│       │   └── config/          # Configuration management
│       ├── resources/
│       │   └── prompts/         # Pre-shipped prompts
│       └── test/                # Integration & unit tests
└── .prompts-mcp/
    └── prompts/                 # Your user prompts (auto-loaded)
```

---

## Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## License

MIT License – see [LICENSE](LICENSE) for details

---

## Links

- 📦 [GitHub Repository](https://github.com/mrsimpson/prompts-mcp)
- 📖 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- 📝 [Blog Post: Prompts als Code](https://oliver-simpson.de/blog/prompts-als-code) (German)

---

## Status

⚠️ **Alpha** – This project is still in early development. Expect breaking changes and rough edges. Feedback and contributions welcome!

Release early in the open. 🚀

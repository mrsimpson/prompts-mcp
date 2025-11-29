# Architecture Document: MCP Prompts Server

## 1. Introduction and Goals

### 1.1 Requirements Overview

The MCP Prompts Server is a lightweight Model Context Protocol (MCP) server that exposes prompts defined in markdown files. It enables organizations to share proven prompts across teams using Git for version control.

**Key Features:**

- Read prompts from markdown files with YAML/JSON front matter
- Expose prompts via MCP protocol with full argument support
- Support both stdio and HTTP transports simultaneously
- Include pre-shipped example prompts
- Allow custom prompts via environment configuration
- Read-only operation (modifications via Git)

### 1.2 Quality Goals

| Priority | Quality Goal        | Motivation                                                                                         |
| -------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| 1        | **Simplicity**      | Easy to deploy, configure, and maintain. Minimal dependencies and clear code structure.            |
| 2        | **Reliability**     | Handle malformed prompts gracefully, continue operating with valid prompts. Clear error messages.  |
| 3        | **Performance**     | Fast startup and response times (<100ms for cached prompts). Support 10+ concurrent connections.   |
| 4        | **Maintainability** | Clean architecture, comprehensive tests, TypeScript type safety. Easy to extend with new features. |
| 5        | **Compatibility**   | Full MCP protocol compliance. Works with all MCP clients (Claude, AI assistants, custom clients).  |

### 1.3 Stakeholders

| Role                      | Expectations                                                   |
| ------------------------- | -------------------------------------------------------------- |
| **Developers**            | Easy integration, clear documentation, TypeScript support      |
| **End Users**             | Reliable prompt access via their AI assistants                 |
| **System Administrators** | Simple deployment, minimal configuration, Git-based management |
| **Prompt Authors**        | Easy-to-write markdown format, clear metadata structure        |

## 2. Constraints

### 2.1 Technical Constraints

- **Language:** TypeScript/Node.js (Node.js >=22)
- **MCP SDK:** Must use `@modelcontextprotocol/sdk` v1.17.5+
- **Package Manager:** pnpm (>=9.0.0)
- **Monorepo:** Must integrate into existing TypeScript monorepo structure
- **Module System:** ESM (ES Modules)

### 2.2 Organizational Constraints

- **Version Control:** Git-based prompt management
- **Read-Only:** No prompt modification via server
- **Deployment:** Standalone server, no heavy infrastructure

## 3. Context and Scope

### 3.1 Business Context

```
┌─────────────┐
│   Prompt    │
│   Authors   │──┐
└─────────────┘  │
                 │  Git Push
                 ↓
            ┌─────────────┐
            │     Git     │
            │ Repository  │
            └─────────────┘
                 │
                 │  Git Pull/Clone
                 ↓
         ┌───────────────────┐
         │  MCP Prompts      │
         │     Server        │
         │  (stdio + HTTP)   │
         └───────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ↓                     ↓
┌─────────────┐     ┌─────────────┐
│  MCP Client │     │  MCP Client │
│  (Claude)   │     │  (Custom)   │
└─────────────┘     └─────────────┘
      │                     │
      ↓                     ↓
┌─────────────┐     ┌─────────────┐
│  Developer  │     │    User     │
└─────────────┘     └─────────────┘
```

### 3.2 Technical Context

**Interfaces:**

| Interface                 | Type         | Description                                                |
| ------------------------- | ------------ | ---------------------------------------------------------- |
| **stdio Transport**       | Input/Output | JSON-RPC over stdin/stdout for local process communication |
| **HTTP Transport**        | Network      | MCP protocol over HTTP for remote access                   |
| **File System**           | Input        | Read markdown prompt files from local directories          |
| **Environment Variables** | Input        | Configuration (custom prompts dir, HTTP port)              |

## 4. Solution Strategy

### 4.1 Technology Decisions

| Aspect               | Decision                    | Rationale                                                     |
| -------------------- | --------------------------- | ------------------------------------------------------------- |
| **MCP SDK**          | `@modelcontextprotocol/sdk` | Official SDK, maintained, full protocol support               |
| **HTTP Framework**   | Hono                        | Lightweight, modern, excellent TypeScript support, edge-ready |
| **Markdown Parsing** | `gray-matter`               | Battle-tested, handles YAML/JSON front matter reliably        |
| **Configuration**    | `process.env` + CLI args    | Simple, no external dependencies                              |
| **Testing**          | Vitest                      | Fast, modern, matches existing monorepo tooling               |
| **Build**            | TypeScript compiler         | Type safety, matches existing monorepo                        |

### 4.2 Architectural Approach

- **Modular Design:** Separate concerns (prompt loading, MCP server, transports)
- **Layered Architecture:** Clear separation between core logic and transport layers
- **Dependency Injection:** Testable components with clear interfaces
- **Fail-Safe:** Graceful handling of invalid prompts, continue with valid ones
- **Stateless:** No server-side state, prompts loaded at startup

### 4.3 Design Patterns

- **Factory Pattern:** Create server instances with different configurations
- **Strategy Pattern:** Different transport implementations (stdio, HTTP)
- **Repository Pattern:** Prompt loading and management abstraction
- **Singleton Pattern:** Single template/prompt manager instance

## 5. Building Block View

### 5.1 Level 1: System Overview

```
┌─────────────────────────────────────────────────────────┐
│             MCP Prompts Server Package                  │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Server Core                            │   │
│  │  - MCP Protocol Handler                        │   │
│  │  - Prompt Management                           │   │
│  │  - Configuration                               │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────┐      ┌────────────────────┐    │
│  │  stdio Transport │      │   HTTP Transport   │    │
│  │                  │      │     (Hono)         │    │
│  └──────────────────┘      └────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Prompt Loader                          │   │
│  │  - File System Scanner                         │   │
│  │  - Markdown Parser (gray-matter)               │   │
│  │  - Validation                                  │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Resources                              │   │
│  │  - Pre-shipped Prompts (bundled)              │   │
│  │  - Custom Prompts (configured)                │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Level 2: Package Structure

```
packages/mcp-server/
├── src/
│   ├── index.ts                  # Main entry point & exports
│   ├── bin.ts                    # CLI entry point (#!/usr/bin/env node)
│   ├── server/
│   │   ├── server.ts            # MCP server implementation
│   │   ├── server-factory.ts   # Server creation with config
│   │   └── handlers/
│   │       ├── list-prompts.ts # Handle prompts/list request
│   │       └── get-prompt.ts   # Handle prompts/get request
│   ├── transports/
│   │   ├── stdio.ts            # stdio transport setup
│   │   └── http.ts             # Hono-based HTTP transport
│   ├── prompts/
│   │   ├── prompt-loader.ts    # Load prompts from directories
│   │   ├── prompt-parser.ts    # Parse markdown with front matter
│   │   ├── prompt-manager.ts   # Manage prompt registry
│   │   ├── prompt-validator.ts # Validate prompt structure
│   │   └── types.ts            # Prompt type definitions
│   ├── config/
│   │   ├── config.ts           # Configuration management
│   │   ├── env.ts              # Environment variable parsing
│   │   └── defaults.ts         # Default configuration values
│   └── utils/
│       ├── logger.ts           # Logging utility
│       └── errors.ts           # Custom error types
├── resources/
│   └── prompts/                # Pre-shipped example prompts
│       ├── code-review.md
│       ├── documentation.md
│       └── brainstorming.md
├── test/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test prompt files
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── vitest.config.ts
```

### 5.3 Component Responsibilities

#### 5.3.1 Server Core (`server/`)

- **Purpose:** Implement MCP protocol, handle requests
- **Responsibilities:**
  - Create and configure MCP Server instance
  - Register prompt capability
  - Handle `prompts/list` and `prompts/get` requests
  - Error handling and response formatting

#### 5.3.2 Transports (`transports/`)

- **Purpose:** Provide communication layers
- **Responsibilities:**
  - **stdio:** Connect server to stdin/stdout
  - **HTTP:** Expose MCP protocol via HTTP using Hono
  - Support simultaneous operation of both transports

#### 5.3.3 Prompt Management (`prompts/`)

- **Purpose:** Load, parse, validate, and manage prompts
- **Responsibilities:**
  - Scan directories for `.md` files
  - Parse YAML/JSON front matter
  - Extract markdown body
  - Validate prompt structure
  - Maintain prompt registry
  - Handle precedence (custom > pre-shipped)

#### 5.3.4 Configuration (`config/`)

- **Purpose:** Manage server configuration
- **Responsibilities:**
  - Parse environment variables
  - Parse CLI arguments
  - Provide defaults
  - Validate configuration

## 6. Runtime View

### 6.1 Server Startup Sequence

```
┌──────┐
│ CLI  │
└───┬──┘
    │
    │ 1. Load Config
    ├──────────────────────────────────────────────────┐
    │                                                   │
    │                                          ┌────────▼─────┐
    │                                          │   Config     │
    │                                          │   Manager    │
    │                                          └────────┬─────┘
    │                                                   │
    │ 2. Load Prompts                                  │
    ├──────────────────────────────────────────────────┤
    │                                                   │
    │                                          ┌────────▼─────┐
    │                                          │   Prompt     │
    │                                          │   Loader     │
    │                                          └────────┬─────┘
    │                                                   │
    │                  3. Scan & Parse                 │
    │         ┌────────────────────┬───────────────────┘
    │         │                    │
    │  ┌──────▼────────┐  ┌────────▼────────┐
    │  │  Pre-shipped  │  │     Custom      │
    │  │    Prompts    │  │    Prompts      │
    │  └──────┬────────┘  └────────┬────────┘
    │         │                    │
    │         └────────────────────┤
    │                              │
    │                     ┌────────▼─────┐
    │                     │   Prompt     │
    │                     │   Manager    │
    │                     └────────┬─────┘
    │                              │
    │ 4. Create Server             │
    ├──────────────────────────────┤
    │                              │
    │                     ┌────────▼─────┐
    │                     │  MCP Server  │
    │                     │    Core      │
    │                     └────────┬─────┘
    │                              │
    │ 5. Setup Transports          │
    ├──────────────────────────────┤
    │         ┌────────────────────┤
    │         │                    │
    │  ┌──────▼──────┐   ┌─────────▼──────┐
    │  │   stdio     │   │      HTTP      │
    │  │  Transport  │   │   Transport    │
    │  └──────┬──────┘   └─────────┬──────┘
    │         │                     │
    │ 6. Ready to Accept Requests  │
    └─────────┴──────────────────────┘
```

### 6.2 Prompt Request Flow

```
┌─────────┐
│  Client │
└────┬────┘
     │
     │ prompts/list request
     ├─────────────────────────────────────────────────┐
     │                                                  │
     │                                         ┌────────▼────┐
     │                                         │  Transport  │
     │                                         │ (stdio/HTTP)│
     │                                         └────────┬────┘
     │                                                  │
     │                                         ┌────────▼────┐
     │                                         │ MCP Server  │
     │                                         │   Handler   │
     │                                         └────────┬────┘
     │                                                  │
     │                                         ┌────────▼────┐
     │                                         │   Prompt    │
     │                                         │   Manager   │
     │                                         └────────┬────┘
     │                                                  │
     │                  List all prompts               │
     │                  with metadata                  │
     │                                                  │
     │ ◄────────────────────────────────────────────────┤
     │                                                  │
     │ prompts/get {name: "code-review"}              │
     ├─────────────────────────────────────────────────┤
     │                                                  │
     │                                         ┌────────▼────┐
     │                                         │   Prompt    │
     │                                         │   Manager   │
     │                                         └────────┬────┘
     │                                                  │
     │                  Return prompt                   │
     │                  content + metadata              │
     │                                                  │
     │ ◄────────────────────────────────────────────────┤
     │                                                  │
     └──────────────────────────────────────────────────┘
```

## 7. Deployment View

### 7.1 Deployment Options

#### Option 1: stdio (Local Development)

```
┌─────────────────────────────────────┐
│        Developer Machine            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │      MCP Client (Claude)     │  │
│  └───────────┬──────────────────┘  │
│              │ stdio                │
│  ┌───────────▼──────────────────┐  │
│  │   MCP Prompts Server         │  │
│  │   (Node.js Process)          │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│  ┌───────────▼──────────────────┐  │
│  │   Prompt Files               │  │
│  │   - /resources/prompts/      │  │
│  │   - $CUSTOM_PROMPTS_DIR      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Option 2: HTTP (Network Access)

```
┌────────────────┐         ┌────────────────────────────┐
│   MCP Client   │         │    Server Machine          │
│   (Remote)     │  HTTP   │                            │
│                ├────────►│  ┌──────────────────────┐  │
└────────────────┘         │  │  MCP Prompts Server  │  │
                           │  │  (HTTP: 3000)        │  │
┌────────────────┐         │  └──────────┬───────────┘  │
│   MCP Client   │         │             │              │
│   (Local)      │  HTTP   │  ┌──────────▼───────────┐  │
│                ├────────►│  │   Prompt Files       │  │
└────────────────┘         │  │   - resources/       │  │
                           │  │   - custom/          │  │
                           │  └──────────────────────┘  │
                           └────────────────────────────┘
```

### 7.2 Installation & Configuration

**NPM Package:**

```bash
# Install
pnpm add @your-org/mcp-prompts-server

# Run with stdio
npx mcp-prompts-server

# Run with HTTP
CUSTOM_PROMPTS_DIR=/path/to/prompts HTTP_PORT=3000 npx mcp-prompts-server
```

**Configuration:**

```bash
# Environment Variables
export CUSTOM_PROMPTS_DIR=/path/to/organization/prompts
export HTTP_PORT=3000

# Or via CLI arguments
mcp-prompts-server --prompts-dir=/path/to/prompts --http-port=3000
```

## 8. Concepts

### 8.1 Prompt File Format

**Example Prompt File** (`code-review.md`):

```markdown
---
name: code-review
description: Review code for quality and best practices
tags: [development, code-quality, review]
arguments:
  - name: language
    description: Programming language of the code
    required: true
  - name: focus
    description: Specific area to focus on (optional)
    required: false
---

Please review the following code for best practices, potential bugs, and improvements.

Consider:

- Code quality and readability
- Performance implications
- Security concerns
- Maintainability

Please provide specific, actionable feedback.
```

### 8.2 Prompt Precedence

When prompts with the same `name` exist in multiple locations:

1. **Custom prompts** (from `CUSTOM_PROMPTS_DIR`) take precedence
2. **Pre-shipped prompts** (from `resources/prompts/`) are fallback

This allows organizations to override default prompts with custom versions.

### 8.3 Error Handling Strategy

| Error Type                   | Handling                          | User Impact                    |
| ---------------------------- | --------------------------------- | ------------------------------ |
| **Invalid prompt file**      | Log error, skip file, continue    | Other prompts still available  |
| **Missing custom directory** | Log warning, use pre-shipped only | Server continues with defaults |
| **Malformed YAML**           | Log error, skip file              | Other prompts still available  |
| **MCP protocol error**       | Return error response to client   | Client sees error message      |
| **Server startup error**     | Log error, exit process           | Server fails to start          |

### 8.4 Logging Strategy

- **stderr** for all logs (stdout reserved for stdio MCP protocol)
- **Levels:** error, warn, info, debug
- **Format:** Structured JSON for machine parsing
- **Examples:**
  - `[INFO] Loaded 5 prompts from /resources/prompts`
  - `[WARN] Skipping invalid prompt file: missing-name.md`
  - `[ERROR] Failed to parse prompt: invalid-yaml.md`

## 9. Design Decisions

### 9.1 ADR-001: Use @modelcontextprotocol/sdk

**Status:** Accepted

**Context:** Need MCP protocol implementation

**Decision:** Use official @modelcontextprotocol/sdk

**Consequences:**

- ✅ Official support and updates
- ✅ Full protocol compliance
- ✅ Battle-tested implementation
- ⚠️ Dependency on external package

### 9.2 ADR-002: Hono for HTTP Transport

**Status:** Accepted

**Context:** Need HTTP framework for HTTP transport

**Decision:** Use Hono instead of Express/Fastify

**Consequences:**

- ✅ Lightweight and fast
- ✅ Excellent TypeScript support
- ✅ Modern, edge-ready
- ✅ Simple API
- ⚠️ Smaller ecosystem than Express

### 9.3 ADR-003: Single Package Architecture

**Status:** Accepted

**Context:** Could split into multiple packages (core, stdio, http)

**Decision:** Single `packages/mcp-server` package

**Consequences:**

- ✅ Simpler to maintain
- ✅ Easier deployment
- ✅ No inter-package versioning issues
- ⚠️ Less modular than multi-package

**Rationale:** Scope is small enough that single package is simpler

### 9.4 ADR-004: Startup Prompt Loading

**Status:** Accepted

**Context:** When to load prompts (startup vs on-demand)

**Decision:** Load all prompts at startup

**Consequences:**

- ✅ Fast response times
- ✅ Simpler implementation
- ✅ Fail-fast on invalid prompts
- ⚠️ Need restart to reload prompts
- ⚠️ Memory usage scales with prompt count

**Rationale:** Simplicity and performance. Restart is acceptable for prompt updates.

### 9.5 ADR-005: gray-matter for Parsing

**Status:** Accepted

**Context:** Need to parse markdown with YAML/JSON front matter

**Decision:** Use gray-matter library

**Consequences:**

- ✅ Battle-tested, widely used
- ✅ Supports YAML and JSON
- ✅ Handles edge cases
- ✅ Good TypeScript support
- ⚠️ Additional dependency

## 10. Quality & Testing

### 10.1 Testing Strategy

| Test Type             | Coverage       | Tools               | Purpose                               |
| --------------------- | -------------- | ------------------- | ------------------------------------- |
| **Unit Tests**        | 80%+           | Vitest              | Test individual functions and classes |
| **Integration Tests** | Key flows      | Vitest              | Test component interactions           |
| **E2E Tests**         | Critical paths | Vitest + MCP client | Test full server operation            |
| **Type Checking**     | 100%           | TypeScript          | Catch type errors at compile time     |

### 10.2 Test Scenarios

**Unit Tests:**

- Prompt file parsing (valid/invalid YAML, markdown)
- Prompt validation (missing fields, invalid types)
- Configuration parsing (env vars, CLI args)
- Prompt precedence logic
- Error handling

**Integration Tests:**

- Load prompts from multiple directories
- MCP server request handling
- Transport communication
- Error responses

**E2E Tests:**

- Start server, list prompts via stdio
- Get specific prompt via stdio
- HTTP transport functionality
- Handle malformed prompts gracefully

### 10.3 Quality Metrics

- **Code Coverage:** ≥80% line coverage
- **Type Coverage:** 100% (strict TypeScript)
- **Build Time:** <10 seconds
- **Startup Time:** <2 seconds
- **Response Time:** <100ms (prompt retrieval)

## 11. Risks and Technical Debt

| Risk                         | Impact | Mitigation                         | Status  |
| ---------------------------- | ------ | ---------------------------------- | ------- |
| **MCP SDK Breaking Changes** | High   | Pin version, test before upgrading | Monitor |
| **Large Prompt Libraries**   | Medium | Implement lazy loading in future   | Accept  |
| **HTTP Transport Security**  | Medium | Document HTTPS/auth best practices | Plan    |
| **Prompt Hot-Reload**        | Low    | Document restart requirement       | Accept  |

## 12. Glossary

| Term                 | Definition                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **MCP**              | Model Context Protocol - standardized protocol for AI assistants to access contextual information |
| **Prompt**           | Template text with metadata that guides AI assistant responses                                    |
| **Front Matter**     | YAML/JSON metadata block at the start of markdown files                                           |
| **stdio**            | Standard input/output communication method for local processes                                    |
| **Transport**        | Communication layer for MCP protocol (stdio or HTTP)                                              |
| **Prompt Arguments** | Parameters that can be filled in when using a prompt                                              |

## 13. References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [@modelcontextprotocol/sdk Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Hono Documentation](https://hono.dev)
- [gray-matter Documentation](https://github.com/jonschlinkert/gray-matter)
- [arc42 Architecture Template](https://arc42.org)

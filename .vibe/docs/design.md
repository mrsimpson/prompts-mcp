# Design Document: MCP Prompts Server

## Project Complexity: 🏢 CORE

Small team, startup phase, 6-month timeline

---

## 1. Naming Conventions

### Classes and Types

- **Classes:** PascalCase with descriptive nouns
  - `PromptLoader`, `PromptManager`, `ServerFactory`
- **Interfaces:** PascalCase with descriptive nouns (no I- prefix)
  - `Prompt`, `PromptMetadata`, `ServerConfig`
- **Types:** PascalCase for type aliases
  - `PromptArgument`, `TransportType`
- **Enums:** PascalCase with UPPER_CASE values
  - `enum TransportType { STDIO = 'stdio', HTTP = 'http' }`

### Methods and Functions

- **Public methods:** camelCase with verb-noun pattern
  - `loadPrompts()`, `getPrompt()`, `validatePromptStructure()`
- **Private methods:** camelCase with leading underscore (optional)
  - `_scanDirectory()`, `_parseFile()`
- **Boolean methods:** Start with `is`, `has`, `should`, `can`
  - `isValidPrompt()`, `hasArguments()`, `shouldOverride()`
- **Factory functions:** Start with `create`
  - `createServer()`, `createPromptManager()`

### Variables and Constants

- **Local variables:** camelCase
  - `promptFile`, `parsedContent`, `serverInstance`
- **Constants:** UPPER_SNAKE_CASE
  - `DEFAULT_HTTP_PORT`, `MAX_PROMPT_SIZE`, `PROMPT_FILE_EXTENSION`
- **Environment variables:** UPPER_SNAKE_CASE
  - `CUSTOM_PROMPTS_DIR`, `HTTP_PORT`, `LOG_LEVEL`

### Packages and Modules

- **Directories:** kebab-case
  - `prompt-loader`, `server-factory`
- **Files:** kebab-case matching primary export
  - `prompt-manager.ts`, `http-transport.ts`
- **Test files:** Same name with `.test.ts` or `.spec.ts`
  - `prompt-parser.test.ts`

---

## 2. Design Principles

### 2.1 Core Principles

1. **KISS (Keep It Simple, Stupid)**
   - Favor simple solutions over clever ones
   - Avoid premature optimization
   - Clear code over concise code

2. **SOLID Principles**
   - **Single Responsibility:** Each class/module has one reason to change
   - **Open/Closed:** Open for extension, closed for modification
   - **Dependency Inversion:** Depend on abstractions, not concretions

3. **Fail-Safe Design**
   - Invalid prompts don't crash the server
   - Log errors clearly, continue with valid data
   - Graceful degradation

4. **Testability First**
   - Pure functions where possible
   - Dependency injection for external dependencies
   - Mockable interfaces

### 2.2 Error Handling Philosophy

- **Defensive Programming:** Validate inputs at boundaries
- **Fail Fast:** Catch errors early, fail loudly during development
- **Fail Safe:** Handle errors gracefully in production
- **Error Context:** Always include context (filename, line number, operation)

**Error Handling Tiers:**

```
Critical → Log + Exit (server startup failures)
Errors → Log + Skip (invalid prompt files)
Warnings → Log + Continue (missing optional fields)
Info → Log (normal operations)
Debug → Log (detailed debugging)
```

---

## 3. Component Design

### 3.1 Prompt Management Layer

**Purpose:** Load, parse, validate, and manage prompt files

**Key Components:**

1. **PromptLoader**
   - Scans directories for `.md` files
   - Reads file contents
   - Delegates parsing to PromptParser
   - Returns array of parsed prompts

2. **PromptParser**
   - Uses `gray-matter` to extract front matter
   - Validates YAML/JSON structure
   - Extracts markdown body
   - Returns structured `Prompt` object

3. **PromptValidator**
   - Validates required fields (name, description)
   - Validates argument structure
   - Validates prompt content
   - Returns validation errors or success

4. **PromptManager**
   - Maintains registry of all prompts (Map<name, Prompt>)
   - Handles precedence (custom > pre-shipped)
   - Provides query methods: `list()`, `get(name)`
   - Thread-safe (immutable after initialization)

**Data Flow:**

```
File System → PromptLoader → PromptParser → PromptValidator → PromptManager
```

### 3.2 Server Layer

**Purpose:** Implement MCP protocol, handle requests

**Key Components:**

1. **ServerFactory**
   - Creates configured MCP Server instance
   - Injects PromptManager dependency
   - Sets up request handlers
   - Returns initialized server

2. **Request Handlers**
   - `ListPromptsHandler`: Returns all available prompts with metadata
   - `GetPromptHandler`: Returns specific prompt by name
   - Error handling wrapper for all handlers

3. **Response Formatters**
   - Convert internal `Prompt` type to MCP protocol format
   - Format error responses per MCP spec
   - Include proper typing information

**Design Pattern:** Handler Chain with Error Boundaries

### 3.3 Transport Layer

**Purpose:** Connect MCP server to communication channels

**Key Components:**

1. **StdioTransport**
   - Uses `@modelcontextprotocol/sdk` stdio transport
   - Connects server to stdin/stdout
   - Handles JSON-RPC over stdio

2. **HttpTransport**
   - Uses Hono framework
   - Exposes MCP protocol over HTTP
   - Maps HTTP requests to MCP messages
   - Returns HTTP responses

**Design Pattern:** Strategy Pattern (interchangeable transports)

### 3.4 Configuration Layer

**Purpose:** Manage server configuration from multiple sources

**Key Components:**

1. **ConfigLoader**
   - Loads from environment variables
   - Parses CLI arguments (if provided)
   - Merges with defaults
   - Validates configuration

2. **Config Schema**
   ```typescript
   interface ServerConfig {
     customPromptsDir?: string;
     httpPort: number;
     logLevel: "error" | "warn" | "info" | "debug";
     transports: TransportType[];
   }
   ```

**Priority:** CLI args > Env vars > Defaults

---

## 4. Data Modeling

### 4.1 Core Data Models

#### Prompt Model

```typescript
interface Prompt {
  name: string; // Unique identifier
  description: string; // Human-readable description
  tags: string[]; // Categorization tags
  content: string; // Markdown body
  arguments?: PromptArgument[]; // Optional parameters
  metadata: PromptMetadata; // Additional info
}

interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

interface PromptMetadata {
  filePath: string; // Source file location
  source: "pre-shipped" | "custom"; // Origin
  loadedAt: Date; // When loaded
}
```

#### Configuration Model

```typescript
interface ServerConfig {
  customPromptsDir?: string;
  httpPort: number;
  logLevel: LogLevel;
  enableStdio: boolean;
  enableHttp: boolean;
}

type LogLevel = "error" | "warn" | "info" | "debug";
```

### 4.2 Data Validation Rules

**Prompt Validation:**

- `name`: Required, non-empty string, alphanumeric + hyphens/underscores
- `description`: Required, non-empty string, max 500 chars
- `tags`: Optional array of strings, each max 50 chars
- `content`: Required, non-empty string
- `arguments[].name`: Required if arguments present
- `arguments[].required`: Must be boolean

**Configuration Validation:**

- `httpPort`: Number between 1024-65535
- `customPromptsDir`: Valid directory path if provided
- At least one transport must be enabled

---

## 5. Interface Design

### 5.1 Public APIs

#### PromptManager Interface

```typescript
interface IPromptManager {
  // Retrieve all prompts with metadata
  listPrompts(): Prompt[];

  // Get specific prompt by name
  getPrompt(name: string): Prompt | null;

  // Check if prompt exists
  hasPrompt(name: string): boolean;

  // Get count of loaded prompts
  getPromptCount(): number;
}
```

#### Server Factory Interface

```typescript
interface IServerFactory {
  // Create and configure server instance
  createServer(config: ServerConfig): Promise<MCPServer>;
}
```

### 5.2 Internal Interfaces

#### PromptLoader Interface

```typescript
interface IPromptLoader {
  // Load prompts from directory
  loadFromDirectory(dirPath: string): Promise<Prompt[]>;
}
```

#### PromptParser Interface

```typescript
interface IPromptParser {
  // Parse markdown file with front matter
  parseFile(filePath: string, content: string): ParseResult;
}

interface ParseResult {
  success: boolean;
  prompt?: Prompt;
  error?: ParseError;
}
```

---

## 6. Quality Attributes Design

### 6.1 Performance Design

**Optimization Strategies:**

- Load prompts once at startup (no lazy loading)
- Cache parsed prompts in memory (Map data structure)
- Avoid file I/O during request handling
- Use streaming for large prompt content (future)

**Performance Targets:**

- Startup time: <2 seconds (100 prompts)
- Prompt retrieval: <100ms
- Memory usage: ~10KB per prompt

### 6.2 Reliability Design

**Error Handling:**

- Validate all external input (files, env vars, MCP requests)
- Isolate failures (bad prompt file doesn't crash server)
- Log all errors with context
- Return meaningful error messages to clients

**Graceful Degradation:**

- Missing custom directory → Use pre-shipped prompts only
- Invalid prompt file → Skip file, log error, continue
- Network issues (HTTP) → Stdio still works

### 6.3 Maintainability Design

**Code Organization:**

- Layered architecture (prompt, server, transport, config)
- Single responsibility per module
- Clear module boundaries
- Minimal coupling between layers

**Testing Strategy:**

- Unit tests for all business logic
- Integration tests for component interactions
- E2E tests for critical user flows
- Test fixtures for common scenarios

**Documentation:**

- JSDoc for all public interfaces
- README for setup and usage
- Architecture doc for high-level design
- Inline comments for complex logic

### 6.4 Extensibility Design

**Extension Points:**

- New transport types (WebSocket, gRPC)
- New prompt sources (database, HTTP API)
- New validation rules
- New MCP capabilities (resources, tools)

**Design for Extension:**

- Interface-based design
- Factory pattern for object creation
- Strategy pattern for swappable algorithms
- Plugin architecture (future)

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
        E2E Tests (10%)
       Integration Tests (30%)
      Unit Tests (60%)
```

### 7.2 Test Coverage Goals

- **Unit Tests:** 80%+ line coverage
- **Integration Tests:** Key component interactions
- **E2E Tests:** Critical user paths

### 7.3 Test Categories

#### Unit Tests

- Prompt parsing (valid/invalid YAML, edge cases)
- Prompt validation (missing fields, invalid types)
- Precedence logic (custom vs pre-shipped)
- Configuration parsing
- Error handling

#### Integration Tests

- Load prompts from multiple directories
- Server request handling
- Transport communication
- Configuration loading

#### E2E Tests

- Server startup → List prompts → Get prompt (stdio)
- Server startup → List prompts → Get prompt (HTTP)
- Handle invalid prompt files gracefully
- Configuration via env vars

### 7.4 Test Data Strategy

**Test Fixtures:**

- Valid prompt examples (minimal, full, with arguments)
- Invalid prompts (missing fields, malformed YAML, etc.)
- Edge cases (empty file, huge file, special characters)

**Location:** `test/fixtures/prompts/`

---

## 8. Logging and Monitoring

### 8.1 Logging Strategy

**Log Levels:**

- **ERROR:** Server startup failures, critical issues
- **WARN:** Invalid prompt files, configuration issues
- **INFO:** Server startup, prompts loaded, requests handled
- **DEBUG:** Detailed operation info, for troubleshooting

**Log Format:**

```json
{
  "timestamp": "2025-11-29T10:30:00.000Z",
  "level": "info",
  "component": "PromptLoader",
  "message": "Loaded 5 prompts from /resources/prompts",
  "context": {
    "directory": "/resources/prompts",
    "promptCount": 5
  }
}
```

**Log Destinations:**

- **stderr:** All logs (stdout reserved for stdio MCP protocol)
- **File:** Optional log file (future enhancement)

### 8.2 Metrics (Future)

**Key Metrics:**

- Prompts loaded count
- Request count by type
- Response time percentiles (p50, p95, p99)
- Error rate
- Memory usage

---

## 9. Security Considerations

### 9.1 Input Validation

- **File paths:** Validate to prevent directory traversal
- **YAML/JSON:** Limit size to prevent DoS
- **Prompt content:** Sanitize special characters
- **Configuration:** Validate ranges and types

### 9.2 Access Control

- **stdio:** Local process only (inherently secure)
- **HTTP:** Consider authentication in deployment (document best practices)

### 9.3 Data Protection

- **Prompt content:** Treat as potentially sensitive
- **Logs:** Avoid logging prompt content (only metadata)
- **No user data:** Server doesn't store user information

---

## 10. Deployment Considerations

### 10.1 Package Structure

**NPM Package Contents:**

- Compiled JavaScript (dist/)
- Type definitions (.d.ts files)
- Pre-shipped prompts (resources/prompts/)
- README, LICENSE

**Binary:**

- `mcp-prompts-server` → Entry point script

### 10.2 Configuration

**Environment Variables:**

```bash
CUSTOM_PROMPTS_DIR=/path/to/prompts
HTTP_PORT=3000
LOG_LEVEL=info
```

**CLI Arguments (Alternative):**

```bash
mcp-prompts-server --prompts-dir=/path/to/prompts --http-port=3000
```

### 10.3 Installation Patterns

**Development:**

```bash
git clone <repo>
pnpm install
pnpm build
pnpm dev
```

**Production:**

```bash
pnpm add @your-org/mcp-prompts-server
npx mcp-prompts-server
```

---

## 11. Implementation Guidelines

### 11.1 Development Workflow

1. **Feature branches:** Create branch per feature
2. **Test-first:** Write tests before implementation (where practical)
3. **Commit early, commit often:** Small, focused commits
4. **Code review:** All changes reviewed before merge
5. **CI/CD:** Automated tests on every push

### 11.2 Code Style

- **Formatting:** Prettier (matches monorepo config)
- **Linting:** ESLint + Oxlint (matches monorepo)
- **TypeScript:** Strict mode enabled
- **Comments:** Explain "why", not "what"

### 11.3 Git Commit Messages

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `chore`: Build/tooling

**Example:**

```
feat(prompts): add prompt argument validation

Implement validation for prompt arguments including
required field checks and type validation.

Closes #42
```

---

## 12. Future Enhancements

**Phase 2 (Post-MVP):**

- Hot-reload prompts without restart
- Prompt search/filtering
- Prompt templates with variables
- Web UI for browsing prompts

**Phase 3 (Advanced):**

- Database backend for prompts
- Prompt versioning API
- Prompt analytics/usage tracking
- Multi-tenant support

---

## Appendix: Key Design Decisions

### DD-001: Map-based Prompt Storage

**Decision:** Use `Map<string, Prompt>` for in-memory storage
**Rationale:** O(1) lookup, simple, sufficient for expected scale (<1000 prompts)

### DD-002: Startup Loading

**Decision:** Load all prompts at startup
**Rationale:** Simple, fast response times, acceptable restart requirement

### DD-003: JSON Logging

**Decision:** Structured JSON logs
**Rationale:** Machine-parseable, easy integration with log aggregators

### DD-004: No Prompt Caching Layer

**Decision:** No separate caching layer (prompts in memory)
**Rationale:** YAGNI - simple in-memory storage is sufficient

### DD-005: Synchronous Prompt Loading

**Decision:** Load prompts synchronously during startup
**Rationale:** Simple error handling, fail-fast on invalid prompts

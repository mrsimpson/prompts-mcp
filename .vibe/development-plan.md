# Development Plan: prompts (main branch)

_Generated on 2025-11-29 by Vibe Feature MCP_
_Workflow: [greenfield](https://mrsimpson.github.io/responsible-vibe-mcp/workflows/greenfield)_

## Goal

Build a simple MCP server that exposes prompts defined in markdown format as MCP prompts, accessible via both stdio and HTTP transports

## Ideation

### Tasks

### Completed

- [x] Created development plan file
- [x] Set up phase entrance criteria
- [x] Defined target users and primary use cases
- [x] Specified markdown format structure for prompts (YAML/JSON front matter + markdown)
- [x] Defined prompt metadata requirements (name, description, tags, arguments)
- [x] Clarified server functionality scope (read-only)
- [x] Determined HTTP transport implementation approach (MCP over HTTP, not SSE)
- [x] Identified technical constraints (TypeScript monorepo)
- [x] Documented comprehensive requirements in requirements.md
- [x] Clarified prompt argument handling (MCP protocol native support, client handles UI)
- [x] Defined file organization (one prompt per file)
- [x] Decided on dual transport support (stdio + HTTP simultaneously)
- [x] Defined prompt storage strategy (pre-shipped + optional custom via env)
- [x] Specified configuration approach (environment variables + CLI args)
- [x] Requirements reviewed and approved by user

## Architecture

### Phase Entrance Criteria:

- [x] Core requirements have been thoroughly defined
- [x] User needs and use cases are clearly documented
- [x] Scope (what's in/out) is well-defined
- [x] Key constraints and non-functional requirements identified

### Tasks

### Completed

- [x] Evaluated MCP SDK options (chose @modelcontextprotocol/sdk)
- [x] Chose HTTP framework (Hono)
- [x] Designed module architecture and package structure
- [x] Defined prompt file parsing strategy (gray-matter)
- [x] Designed configuration management approach (env vars + CLI args)
- [x] Planned error handling and logging strategy
- [x] Documented architecture decisions in architecture.md
- [x] Created architecture diagrams (ASCII art in doc)
- [x] Reviewed existing MCP servers for patterns (quiet-shell, responsible-vibe)
- [x] Documented 5 ADRs (Architecture Decision Records)
- [x] Architecture reviewed and approved by user

_None yet_

## Plan

### Phase Entrance Criteria:

- [x] Technical architecture has been designed
- [x] Technology stack has been selected and justified
- [x] Architecture document is complete
- [x] Architectural patterns and design decisions are documented

### Tasks

### Completed

- [x] Created comprehensive design document
- [x] Defined naming conventions and code standards
- [x] Designed component interfaces and data models
- [x] Planned error handling and logging strategy
- [x] Defined testing strategy (unit, integration, E2E)
- [x] Documented quality attributes design
- [x] Created detailed implementation task breakdown (in Code section)
- [x] Implementation plan reviewed and approved by user

## Code

### Phase Entrance Criteria:

- [ ] Implementation plan is complete and detailed
- [ ] Tasks are broken down into actionable steps
- [ ] Dependencies between tasks are identified
- [ ] Design document thoroughly describes the solution

### Implementation Plan

#### Milestone 1: Project Foundation (Dependencies: none)

- [x] Create package structure (packages/mcp-server/)
- [x] Set up package.json with dependencies
- [x] Configure TypeScript (tsconfig.json, tsconfig.build.json)
- [x] Set up Vitest configuration
- [x] Create directory structure (src/, test/, resources/)
- [x] Add ESLint, Prettier configs (copy from monorepo)

#### Milestone 2: Core Type Definitions (Dependencies: M1)

- [x] Define Prompt interface and types (src/prompts/types.ts)
- [x] Define PromptArgument interface
- [x] Define PromptMetadata interface
- [x] Define ServerConfig interface (src/config/types.ts)
- [x] Define error types (src/utils/errors.ts)
- [x] Write unit tests for type guards/validators (25 tests passing)

#### Milestone 3: Configuration Layer (Dependencies: M2)

- [x] Implement default configuration (src/config/defaults.ts)
- [x] Implement environment variable parser (src/config/env.ts)
- [x] Implement ConfigLoader (src/config/config.ts)
- [x] Write unit tests for configuration loading (10 tests passing)
- [x] Test precedence: CLI > env > defaults

#### Milestone 4: Utility Layer (Dependencies: M2)

- [x] Implement logger utility (src/utils/logger.ts)
- [x] Implement custom error classes (src/utils/errors.ts)

#### Milestone 5: Prompt Parsing (Dependencies: M2, M4)

- [x] Install gray-matter dependency
- [x] Implement PromptParser (src/prompts/prompt-parser.ts)
- [x] Parse YAML/JSON front matter
- [x] Extract markdown body
- [x] Handle parsing errors gracefully
- [x] Write unit tests with valid prompts (9 tests passing)
- [x] Write unit tests with invalid prompts (edge cases covered)
- [x] Create test fixtures (test/fixtures/prompts/)

#### Milestone 6: Prompt Validation (Dependencies: M2, M5)

- [x] Implement PromptValidator (src/prompts/prompt-validator.ts)
- [x] Validate required fields (name, description)
- [x] Validate optional fields (tags, arguments)
- [x] Validate argument structure
- [x] Write unit tests for all validation rules (44 tests passing)
- [x] Test edge cases (empty strings, special characters)

#### Milestone 7: Prompt Loading (Dependencies: M5, M6)

- [x] Implement PromptLoader (src/prompts/prompt-loader.ts)
- [x] Scan directory for .md files
- [x] Read file contents
- [x] Use PromptParser to parse files
- [x] Use PromptValidator to validate prompts
- [x] Handle file I/O errors gracefully
- [x] Write integration tests with real test fixtures (6 tests passing)
- [x] Test error handling and invalid files

#### Milestone 8: Prompt Management (Dependencies: M7)

- [x] Implement PromptManager (src/prompts/prompt-manager.ts)
- [x] Maintain Map<string, Prompt> registry
- [x] Implement listPrompts() method
- [x] Implement getPrompt(name) method
- [x] Implement hasPrompt(name) method
- [x] Handle precedence (custom > pre-shipped)
- [x] Write unit tests for all methods (33 tests passing)
- [x] Test precedence logic with duplicates

#### Milestone 9: Pre-shipped Prompts (Dependencies: none)

- [x] Create resources/prompts/ directory
- [x] Write code-review.md example prompt
- [x] Write documentation.md example prompt
- [x] Write brainstorming.md example prompt
- [x] Write meeting-notes.md example prompt
- [x] Write refactoring.md example prompt
- [x] Validate all example prompts
- [x] Write integration tests for pre-shipped prompts (7 tests passing)

#### Milestone 10: MCP Server Core (Dependencies: M3, M8)

- [x] Install @modelcontextprotocol/sdk dependency
- [x] Install zod dependency (required by MCP SDK)
- [x] Add serverName and serverVersion to ServerConfig
- [x] Implement ServerFactory (src/server/server-factory.ts)
- [x] Create MCP Server instance using McpServer class
- [x] Register prompts capability
- [x] Implement prompt registration with arguments support
- [x] Handle prompts with and without arguments
- [x] Format responses per MCP protocol (GetPromptResult)
- [x] Handle errors during prompt registration
- [x] Write unit tests for ServerFactory (6 tests passing)
- [x] Update config tests for new ServerConfig fields

#### Milestone 11: stdio Transport (Dependencies: M10)

- [x] Implement stdio transport setup (src/transports/stdio.ts)
- [x] Use @modelcontextprotocol/sdk StdioServerTransport
- [x] Connect server to stdio transport
- [x] Handle process signals (SIGINT, SIGTERM)
- [x] Write integration tests for stdio communication (12 tests passing)

#### Milestone 12: HTTP Transport (Dependencies: M10)

- [x] Install Hono dependency
- [x] Implement HTTP transport (src/transports/http.ts)
- [x] Create Hono app instance
- [x] Map HTTP requests to MCP messages
- [x] Handle MCP protocol over HTTP (StreamableHTTPServerTransport)
- [x] Return HTTP responses
- [x] Configure port from HttpTransportOptions
- [x] Add health check endpoint
- [x] Support stateful (sessions) and stateless modes
- [x] Support JSON and SSE response modes
- [x] Write integration tests for HTTP communication (14 tests passing)
- [x] Test concurrent requests via multiple ports

#### Milestone 13: Main Entry Points (Dependencies: M3, M11, M12)

- [ ] Implement bin.ts (CLI entry point with shebang)
- [ ] Implement index.ts (main entry point)
- [ ] Load configuration
- [ ] Load prompts (pre-shipped + custom if configured)
- [ ] Create server instance
- [ ] Setup transports (stdio and/or HTTP)
- [ ] Handle startup errors
- [ ] Log startup information
- [ ] Write E2E tests for server startup

#### Milestone 14: Build & Package (Dependencies: M13)

- [ ] Update root package.json paths for new package
- [ ] Configure package.json exports
- [ ] Set up bin configuration in package.json
- [ ] Add build scripts
- [ ] Test build output
- [ ] Verify executable permissions on bin.ts
- [ ] Test local installation (pnpm link)

#### Milestone 15: Testing & Quality (Dependencies: M1-M14)

- [ ] Achieve 80%+ unit test coverage
- [ ] Run all integration tests
- [ ] Run all E2E tests
- [ ] Run linters (ESLint, Oxlint)
- [ ] Run formatter (Prettier)
- [ ] Run type checker (tsc --noEmit)
- [ ] Fix all issues
- [ ] Generate coverage report

#### Milestone 16: Documentation (Dependencies: M14)

- [ ] Write package README.md
- [ ] Document installation
- [ ] Document configuration options
- [ ] Document usage examples (stdio, HTTP)
- [ ] Document prompt file format
- [ ] Add JSDoc comments to public APIs
- [ ] Create example prompt files with comments

### Tasks

### Completed

_None yet_

## Finalize

### Phase Entrance Criteria:

- [ ] All planned features are implemented
- [ ] Core functionality is working as expected
- [ ] Tests are passing
- [ ] Code is ready for cleanup and review

### Tasks

- [ ] _To be added when this phase becomes active_

### Completed

_None yet_

## Key Decisions

### KD-1: Prompt Format

- **Decision:** Use YAML/JSON front matter + markdown body
- **Rationale:** Provides structured metadata while keeping content human-readable and easy to edit
- **Metadata Fields:** name, description, tags, plus MCP prompt arguments where supported

### KD-2: Version Control Strategy

- **Decision:** Git-based versioning, no built-in version control
- **Rationale:** Leverages existing Git workflows, keeps server simple, fits organizational workflow

### KD-3: Read-Only Server

- **Decision:** Server provides read-only access to prompts
- **Rationale:** Modifications controlled through Git, prevents conflicts, maintains audit trail

### KD-4: Technology Stack

- **Decision:** TypeScript monorepo
- **Rationale:** Type safety, matches existing scaffold, allows future CLI package addition

### KD-5: Transport Protocols

- **Decision:** stdio + HTTP (MCP protocol, not SSE)
- **Rationale:** stdio for local dev, HTTP for remote access, SSE deprecated in MCP spec

### KD-7: Prompt Argument Handling

- **Decision:** Use MCP protocol's native argument support, no custom templating
- **Rationale:** MCP clients handle parameter prompting and substitution, keeps server simple

### KD-8: File Organization

- **Decision:** One prompt per file
- **Rationale:** Simplifies parsing, Git diffs, and prompt management

### KD-9: Dual Transport Support

- **Decision:** Support stdio and HTTP simultaneously
- **Rationale:** No technical barrier, provides flexibility for different use cases

### KD-11: MCP SDK Selection

- **Decision:** Use `@modelcontextprotocol/sdk` (official SDK)
- **Rationale:** Official support, full protocol compliance, battle-tested

### KD-12: HTTP Framework - Hono

- **Decision:** Use Hono instead of Express/Fastify
- **Rationale:** Lightweight, modern, excellent TypeScript support, edge-ready, simple API

### KD-13: Single Package Architecture

- **Decision:** Single `packages/mcp-server` package (not split into core/transports)
- **Rationale:** Simpler maintenance, easier deployment, scope small enough for single package

### KD-14: Startup Prompt Loading

- **Decision:** Load all prompts at server startup (not on-demand)
- **Rationale:** Fast response times, simpler implementation, acceptable to restart for updates

### KD-16: Implementation Phases

- **Decision:** 16 milestones, bottom-up approach (types → utils → parsing → server → transports)
- **Rationale:** Build foundation first, clear dependencies, testable at each step

### KD-17: Test Strategy

- **Decision:** 80%+ unit coverage, integration tests for component interaction, E2E for critical paths
- **Rationale:** Balance between coverage and maintainability

### KD-18: Pre-shipped Prompts

- **Decision:** Include 5 example prompts: code-review, documentation, brainstorming, meeting-notes, refactoring
- **Rationale:** Provide immediate value, demonstrate prompt format, cover common use cases

## Notes

### Organizational Context

- Primary use case: Share proven prompts across organization
- Users: Developers + normal users with AI assistants
- Existing monorepo scaffold in place

### Future Enhancements (Out of Current Scope)

- CLI package for prompt management
- Hot-reload mechanism for Git updates
- Prompt search/filtering capabilities

### Technical References

- MCP Protocol: Model Context Protocol specification
- Comparison: Langfuse (too complex for this use case)

---

_This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on._

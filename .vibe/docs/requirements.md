<!--
INSTRUCTIONS FOR REQUIREMENTS (EARS FORMAT):
- Use EARS format
- Number requirements as REQ-1, REQ-2, etc.
- Keep user stories concise and focused on user value
- Make acceptance criteria specific and testable
- Reference requirements in tasks using: (_Requirements: REQ-1, REQ-3_)

EXAMPLE:
## REQ-1: User Authentication
**User Story:** As a website visitor, I want to create an account so that I can access personalized features.

**Acceptance Criteria:**
- WHEN user provides valid email and password THEN the system SHALL create new account
- WHEN user provides duplicate email THEN the system SHALL show "email already exists" error
- WHEN user provides weak password THEN the system SHALL show password strength requirements

FULL EARS SYNTAX:
While <optional pre-condition>, when <optional trigger>, the <system name> shall <system response>

The EARS ruleset states that a requirement must have: Zero or many preconditions; Zero or one trigger; One system name; One or many system responses.

The application of the EARS notation produces requirements in a small number of patterns, depending on the clauses that are used. The patterns are illustrated below.

Ubiquitous requirements
Ubiquitous requirements are always active (so there is no EARS keyword)

The <system name> shall <system response>

Example: The mobile phone shall have a mass of less than XX grams.

State driven requirements
State driven requirements are active as long as the specified state remains true and are denoted by the keyword While.

While <precondition(s)>, the <system name> shall <system response>

Example: While there is no card in the ATM, the ATM shall display “insert card to begin”.

Event driven requirements
Event driven requirements specify how a system must respond when a triggering event occurs and are denoted by the keyword When.

When <trigger>, the <system name> shall <system response>

Example: When “mute” is selected, the laptop shall suppress all audio output.

Optional feature requirements
Optional feature requirements apply in products or systems that include the specified feature and are denoted by the keyword Where.

Where <feature is included>, the <system name> shall <system response>

Example: Where the car has a sunroof, the car shall have a sunroof control panel on the driver door.

Unwanted behavior requirements
Unwanted behavior requirements are used to specify the required system response to undesired situations and are denoted by the keywords If and Then.

If <trigger>, then the <system name> shall <system response>

Example: If an invalid credit card number is entered, then the website shall display “please re-enter credit card details”.

Complex requirements
The simple building blocks of the EARS patterns described above can be combined to specify requirements for richer system behavior. Requirements that include more than one EARS keyword are called Complex requirements.

While <precondition(s)>, When <trigger>, the <system name> shall <system response>

Example: While the aircraft is on ground, when reverse thrust is commanded, the engine control system shall enable reverse thrust.

Complex requirements for unwanted behavior also include the If-Then keywords.
-->

# Requirements Document

## Project Overview

**Purpose:** Build an MCP server that exposes prompts defined in markdown files, enabling organizations to share proven prompts across teams using Git for version control.

**Target Users:**

- Developers integrating the MCP server into their workflows
- Normal users whose AI assistants connect to the MCP server

**Primary Use Case:** Share helpful prompts across an organization through a centralized, version-controlled prompt library

**Out of Scope (Initial Version):**

- Prompt modification via server (read-only operation)
- Real-time prompt editing capabilities
- Built-in version control (handled by Git)
- Complex prompt management UI
- Prompt execution or evaluation

## REQ-1: Prompt File Format

**User Story:** As a prompt author, I want to define prompts in a simple markdown format with metadata so that I can easily create and maintain prompt libraries.

**Acceptance Criteria:**

- The system SHALL support markdown files with YAML/JSON front matter for metadata
- The system SHALL use one prompt per file
- WHEN a prompt file is read THEN the system SHALL parse front matter containing: name, description, tags, and optional arguments array
- WHEN a prompt file is read THEN the system SHALL extract the markdown body as the prompt content
- Where a prompt defines arguments THEN the system SHALL expose them via MCP protocol argument schema
- WHEN MCP client requests a prompt with arguments THEN the system SHALL return the prompt with argument definitions per MCP specification

## REQ-2: Prompt Storage and Discovery

**User Story:** As a system administrator, I want the server to include pre-shipped prompts and support custom prompt directories so that I can use built-in prompts and add organization-specific ones.

**Acceptance Criteria:**

- The system SHALL include a set of pre-shipped prompts bundled with the server
- The system SHALL support an optional custom prompt directory configured via environment variable
- WHEN the server starts THEN the system SHALL scan both pre-shipped and custom directories for markdown prompt files
- WHEN a prompt file has valid structure THEN the system SHALL register it as an available MCP prompt
- If a prompt file has invalid structure THEN the system SHALL log an error and skip the file
- Where custom and pre-shipped prompts have the same name THEN the custom prompt SHALL take precedence

## REQ-3: MCP Protocol Compliance

**User Story:** As a developer, I want the server to fully implement the MCP protocol for prompts so that it works seamlessly with MCP clients.

**Acceptance Criteria:**

- The system SHALL implement the MCP prompts capability according to the MCP specification
- WHEN a client requests available prompts THEN the system SHALL return all registered prompts with their metadata
- WHEN a client requests a specific prompt THEN the system SHALL return the prompt content and metadata
- Where prompts have parameters THEN the system SHALL expose them according to MCP protocol standards

## REQ-4: stdio Transport

**User Story:** As a developer, I want to connect to the server via stdio so that I can integrate it with local development tools.

**Acceptance Criteria:**

- The system SHALL support MCP communication over stdio transport
- WHEN launched with stdio mode THEN the system SHALL communicate using JSON-RPC over stdin/stdout
- WHEN a client sends valid MCP messages THEN the system SHALL respond according to MCP protocol

## REQ-5: HTTP Transport

**User Story:** As a developer, I want to connect to the server via HTTP so that I can access prompts from remote clients.

**Acceptance Criteria:**

- The system SHALL support MCP communication over HTTP transport (not SSE)
- The system SHALL support running both stdio and HTTP transports simultaneously
- WHEN launched with HTTP mode enabled THEN the system SHALL listen on a configurable port (default: 3000)
- WHEN a client connects via HTTP THEN the system SHALL handle MCP protocol messages over HTTP
- The system SHALL implement proper HTTP status codes and error handling

## REQ-6: TypeScript Monorepo Structure

**User Story:** As a developer, I want the codebase organized as a TypeScript monorepo so that I can maintain clean architecture and potentially add CLI tools later.

**Acceptance Criteria:**

- The system SHALL be structured as a TypeScript monorepo
- The system SHALL have an MCP server package as the core component
- The system SHALL use standard TypeScript tooling (build, lint, test)
- The architecture SHALL support adding additional packages (e.g., CLI) in the future

## REQ-7: Read-Only Operations

**User Story:** As a system administrator, I want the server to operate in read-only mode so that prompt modifications are controlled through Git workflows.

**Acceptance Criteria:**

- The system SHALL NOT provide any prompt modification capabilities via the MCP interface
- The system SHALL NOT write to prompt files during operation
- WHEN prompts are updated via Git THEN administrators can restart the server to load new prompts

## REQ-8: Configuration Management

**User Story:** As a system administrator, I want simple configuration options so that I can easily deploy and customize the server.

**Acceptance Criteria:**

- The system SHALL support configuration via environment variables
- The system SHALL use environment variable `CUSTOM_PROMPTS_DIR` for custom prompt directory path
- The system SHALL use environment variable `HTTP_PORT` for HTTP server port (default: 3000)
- WHEN no custom prompts directory is configured THEN the system SHALL only serve pre-shipped prompts
- The system SHALL support configuration via CLI arguments as an alternative to environment variables

## Non-Functional Requirements

### NFR-1: Simplicity

- The system SHALL prioritize simplicity over feature richness
- The system SHALL have minimal configuration requirements
- The system SHALL be easy to deploy and maintain

### NFR-2: Performance

- WHEN prompts are requested THEN the system SHALL respond within 100ms for cached prompts
- The system SHALL handle at least 10 concurrent connections without degradation

### NFR-3: Reliability

- If a prompt file is malformed THEN the system SHALL continue operating with other valid prompts
- The system SHALL log errors clearly for troubleshooting

### NFR-4: Comparison to Existing Solutions

- **Langfuse Analysis:** Langfuse provides prompt management, versioning, analytics, and observability - far more complex than needed
- **Gap Filled:** Simple, lightweight MCP server focused solely on serving Git-versioned prompts without heavy infrastructure

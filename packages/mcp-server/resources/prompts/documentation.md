---
name: documentation
description: Generates comprehensive documentation for code including API docs, usage examples, and explanatory comments
tags:
  - documentation
  - comments
  - api
  - examples
arguments:
  - name: code
    description: The code to document (function, class, module, or API)
    required: true
  - name: language
    description: Programming language (e.g., TypeScript, Python, Java)
    required: false
  - name: format
    description: Documentation format (e.g., JSDoc, Python docstring, Markdown, OpenAPI)
    required: false
  - name: audience
    description: Target audience (e.g., developers, end-users, API consumers)
    required: false
---

# Documentation Generation Prompt

Generate comprehensive, clear, and professional documentation for the provided code.

## Documentation Requirements

### 1. Overview

- Brief description of what the code does
- Primary purpose and use cases
- Key features or capabilities

### 2. API Documentation

{{#if format}}

- Format: {{format}}
  {{else}}
- Use standard format for {{language}}
  {{/if}}
- Document all public functions/methods/classes
- Include parameter types and descriptions
- Document return values and types
- Note any exceptions or errors that may be thrown

### 3. Usage Examples

- Provide clear, practical examples
- Show common use cases
- Include edge cases if relevant
  {{#if audience}}
- Tailor examples for {{audience}}
  {{/if}}

### 4. Code Comments

- Add inline comments explaining complex logic
- Document any non-obvious decisions or trade-offs
- Explain "why" not just "what"

### 5. Additional Information

- Prerequisites or dependencies
- Configuration requirements (if any)
- Performance considerations
- Known limitations or gotchas

## Style Guidelines

- Use clear, concise language
- Write in active voice
- Include code examples with proper syntax highlighting
- Organize content logically with appropriate headings
- Make it scannable and easy to navigate

**Code to Document:**

```{{language}}
{{code}}
```

Please provide complete documentation following the above structure.

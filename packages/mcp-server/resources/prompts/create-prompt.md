---
name: create-prompt
description: Helps you create well-structured MCP prompt files with proper front matter, Handlebars templates, and best practices
tags:
  - meta
  - prompts
  - creation
  - mcp
arguments:
  - name: purpose
    description: What should this prompt accomplish? Describe the goal and use case.
    required: true
  - name: target_audience
    description: Who will use this prompt? (e.g., developers, writers, analysts)
    required: false
  - name: parameters
    description: What parameters/arguments should the prompt accept? Describe each parameter and whether it's required.
    required: false
---

# MCP Prompt Creation Assistant

Let me help you create a well-structured MCP prompt file that follows best practices.

## Your Prompt Goal

**Purpose**: {{purpose}}

{{#if target_audience}}
**Target Audience**: {{target_audience}}
{{/if}}

{{#if parameters}}
**Desired Parameters**: {{parameters}}
{{/if}}

---

## Prompt File Structure

I'll create a complete prompt file for you following this structure:

### 1. Front Matter (YAML)

The front matter defines metadata about your prompt:

```yaml
---
name: your-prompt-name # Unique identifier (lowercase, hyphens)
description: Brief description # One-line summary of what it does
tags: # Categorization tags
  - tag1
  - tag2
arguments: # Optional parameters
  - name: param1
    description: What this parameter does
    required: true # or false
  - name: param2
    description: Another parameter
    required: false
---
```

### 2. Prompt Content (Markdown + Handlebars)

After the front matter, write your prompt using:

- **Markdown** for formatting (headings, lists, code blocks, etc.)
- **Handlebars** for dynamic content with parameters

## Handlebars Template Syntax

### Basic Variable Substitution

```handlebars
{{variableName}}
```

Use this to insert parameter values into your prompt.

### Conditional Blocks (for optional parameters)

```handlebars
{{#if parameterName}}
  This content only appears if parameterName is provided Value:
  {{parameterName}}
{{/if}}

{{#unless parameterName}}
  This appears if parameterName is NOT provided
{{/unless}}
```

### Iteration (for array parameters)

```handlebars
{{#each items}}
  -
  {{this}}
{{/each}}

{{#each objects}}
  -
  {{this.name}}:
  {{this.value}}
{{/each}}
```

### Conditionals with else

```handlebars
{{#if language}}
  Programming language:
  {{language}}
{{else}}
  Using generic approach (no language specified)
{{/if}}
```

## Best Practices

### ✅ DO:

- **Use clear, descriptive names** (e.g., `code-review`, `generate-documentation`)
- **Write detailed descriptions** that explain the prompt's purpose
- **Structure prompts logically** with clear sections using markdown headings
- **Make optional parameters truly optional** with `{{#if}}` blocks
- **Provide context and examples** in the prompt to guide the AI
- **Use consistent formatting** throughout the prompt
- **Add helpful tags** for discoverability

### ❌ DON'T:

- Use spaces or special characters in prompt names (use hyphens)
- Make prompts too generic or vague
- Forget to validate required parameters
- Mix template syntax incorrectly
- Overuse complex Handlebars features

## Example Prompt File

Here's a complete example to illustrate the structure:

```markdown
---
name: analyze-code
description: Analyzes code for potential improvements, bugs, and best practices
tags:
  - code
  - analysis
  - quality
arguments:
  - name: code
    description: The code to analyze
    required: true
  - name: language
    description: Programming language (e.g., TypeScript, Python)
    required: false
  - name: focus_area
    description: Specific area to focus on (e.g., performance, security)
    required: false
---

# Code Analysis Request

Please analyze the following code and provide detailed feedback.

{{#if language}}

## Language: {{language}}

{{/if}}

{{#if focus_area}}

## Focus Area: {{focus_area}}

Pay special attention to {{focus_area}}-related aspects.
{{/if}}

## Code to Analyze

\`\`\`{{language}}
{{code}}
\`\`\`

## Analysis Criteria

Please evaluate:

1. **Code Quality**: Readability, maintainability, structure
2. **Best Practices**: Language-specific idioms and patterns
3. **Potential Issues**: Bugs, edge cases, error handling
4. **Performance**: Efficiency and optimization opportunities
5. **Security**: Vulnerabilities and security concerns

Provide specific, actionable recommendations for improvement.
```

---

## Your Custom Prompt

Based on your requirements, here's a suggested prompt structure:

_[I'll now generate a complete, ready-to-use prompt file tailored to your specified purpose, target audience, and parameters. The prompt will include proper front matter, well-structured content, appropriate use of Handlebars templates, and follow all best practices outlined above.]_

### Suggested Prompt Name

_[Generate a descriptive, lowercase, hyphenated name based on the purpose]_

### Recommended Tags

_[Suggest relevant tags for categorization]_

### Parameters Definition

_[List and define all parameters based on the user's input, specifying which are required]_

### Complete Prompt File

```markdown
[Generate the complete prompt file here with proper YAML front matter and markdown content]
```

---

## Next Steps

1. **Save the file**: Copy the generated prompt to `.prompts-mcp/prompts/your-prompt-name.md`
2. **Test it**: Restart the MCP server and verify the prompt appears
3. **Iterate**: Refine the prompt based on actual usage and results
4. **Share**: Consider contributing useful prompts back to the community

## Tips for Effective Prompts

- **Be specific**: Clear instructions produce better results
- **Provide context**: Help the AI understand the task and constraints
- **Structure output**: Guide the format of responses you want
- **Use examples**: Show what good output looks like
- **Iterate**: Refine prompts based on actual usage

Happy prompt creating! 🚀

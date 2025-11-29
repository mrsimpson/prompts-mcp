---
name: code-review
description: Performs a thorough code review focusing on best practices, potential bugs, security issues, and performance optimizations
tags:
  - code
  - review
  - quality
  - security
arguments:
  - name: code
    description: The code to review (paste code snippet or file contents)
    required: true
  - name: language
    description: Programming language of the code (e.g., TypeScript, Python, Java)
    required: false
  - name: focus
    description: Specific aspects to focus on (e.g., security, performance, readability)
    required: false
---

# Code Review Prompt

Please conduct a comprehensive code review of the provided code. Analyze the following aspects:

## Code Quality
- **Readability**: Is the code easy to understand? Are naming conventions clear and consistent?
- **Maintainability**: Is the code well-structured? Are there any code smells?
- **Best Practices**: Does the code follow {{language}} best practices and idioms?

## Functionality & Logic
- **Correctness**: Does the code logic appear sound? Are there any potential bugs?
- **Edge Cases**: Are edge cases and error conditions handled properly?
- **Testing**: Are there obvious test scenarios that should be covered?

## Security
- **Vulnerabilities**: Are there any security concerns (injection, XSS, auth issues)?
- **Input Validation**: Is user input properly validated and sanitized?
- **Data Exposure**: Are sensitive data or credentials properly protected?

## Performance
- **Efficiency**: Are there any performance bottlenecks or inefficiencies?
- **Scalability**: Will this code scale well with increased load?
- **Resource Usage**: Are resources (memory, connections) managed properly?

## Architecture & Design
- **SOLID Principles**: Does the code follow good OOP/functional design principles?
- **Coupling**: Is the code appropriately modular with low coupling?
- **Reusability**: Are there opportunities for code reuse or abstraction?

{{#if focus}}
**Special Focus**: Pay particular attention to {{focus}}.
{{/if}}

Please provide:
1. A summary of overall code quality
2. Specific issues found (categorized by severity: critical, important, minor)
3. Concrete recommendations for improvement
4. Positive aspects worth highlighting

**Code to Review:**
```{{language}}
{{code}}
```

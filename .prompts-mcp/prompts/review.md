---
name: code-review
description: Perform a code review with specific focus areas
arguments:
  - name: code
    description: The code to review
    required: true
  - name: focus
    description: Specific aspects to focus on
    required: false
---

Review the following code:

```
{{code}}
```

{{#if focus}}
Focus specifically on: {{focus}}
{{/if}}

Provide feedback on:

1. Code quality and maintainability
2. Comments that describe the process of the code creation of are redundant to variables and functions
3. Potential bugs or issues
4. Performance considerations
5. Best practices

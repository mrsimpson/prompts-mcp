---
name: refactoring
description: Suggests refactoring improvements for code including design patterns, structure improvements, and modernization
tags:
  - refactoring
  - code-quality
  - patterns
  - improvement
arguments:
  - name: code
    description: The code to refactor
    required: true
  - name: language
    description: Programming language of the code
    required: false
  - name: goal
    description: Refactoring goal (e.g., improve readability, reduce complexity, apply patterns, modernize)
    required: false
  - name: constraints
    description: Constraints or requirements (e.g., maintain backward compatibility, no external dependencies)
    required: false
---

# Code Refactoring Assistant

Analyze the provided code and suggest refactoring improvements to enhance quality, maintainability, and design.

{{#if goal}}

## Refactoring Goal

{{goal}}
{{/if}}

{{#if constraints}}

## Constraints

{{constraints}}
{{/if}}

## Analysis Framework

### 1. Current State Assessment

- **Code Structure**: Analyze current organization and design
- **Complexity**: Identify areas of high complexity or code smells
- **Patterns**: Note existing patterns (good and bad)
- **Dependencies**: Assess coupling and cohesion

### 2. Refactoring Opportunities

#### A. Structural Improvements

- **Modularity**: Break down large functions/classes
- **Separation of Concerns**: Identify mixed responsibilities
- **Naming**: Improve clarity of names
- **Code Duplication**: Find and eliminate redundancy

#### B. Design Patterns

- Identify applicable design patterns:
  - Creational (Factory, Builder, Singleton, etc.)
  - Structural (Adapter, Decorator, Facade, etc.)
  - Behavioral (Strategy, Observer, Command, etc.)
- Suggest where patterns could simplify design

#### C. Modern {{language}} Features

- Use modern language features and idioms
- Replace verbose code with concise alternatives
- Improve type safety (if applicable)
- Enhance error handling

#### D. Performance Optimizations

- Identify inefficient algorithms or data structures
- Suggest performance improvements
- Note any premature optimizations to remove

### 3. Refactoring Plan

Provide a prioritized refactoring plan:

**Phase 1: Quick Wins** (low risk, high value)

- Simple improvements that can be done immediately
- Automated refactoring tool opportunities

**Phase 2: Structural Changes** (medium risk)

- Function/method extraction and organization
- Class/module restructuring
- Interface improvements

**Phase 3: Design Improvements** (requires testing)

- Design pattern implementations
- Architectural changes
- API redesigns

### 4. Refactored Code

Provide refactored code examples showing:

- Before/after comparisons for key changes
- Complete refactored version if scope is manageable
- Detailed comments explaining changes

### 5. Testing Considerations

- Suggest test cases to verify behavior is preserved
- Identify areas needing additional test coverage
- Note any behavior changes (if intentional)

### 6. Migration Path

If changes are significant:

- Step-by-step migration approach
- Backward compatibility strategies
- Deprecation timeline (if applicable)

---

**Code to Refactor:**

```{{language}}
{{code}}
```

---

Please provide a thorough refactoring analysis following the framework above. Be specific with examples and explain the reasoning behind each suggestion.

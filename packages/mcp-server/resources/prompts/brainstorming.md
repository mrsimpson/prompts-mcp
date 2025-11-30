---
name: brainstorming
description: Facilitates creative brainstorming sessions for problem-solving, feature ideas, or technical approaches
tags:
  - brainstorming
  - ideas
  - creativity
  - planning
arguments:
  - name: topic
    description: The topic, problem, or question to brainstorm about
    required: true
  - name: context
    description: Additional context, constraints, or background information
    required: false
  - name: goal
    description: Specific goal or desired outcome from the brainstorming
    required: false
  - name: technique
    description: Brainstorming technique to use (e.g., mind-map, SCAMPER, reverse-thinking, six-hats)
    required: false
---

# Brainstorming Assistant

Let's conduct a productive brainstorming session to explore ideas, solutions, and possibilities.

## Brainstorming Topic

**{{topic}}**

{{#if context}}

## Context & Background

{{context}}
{{/if}}

{{#if goal}}

## Desired Outcome

{{goal}}
{{/if}}

## Brainstorming Approach

{{#if technique}}
We'll use the **{{technique}}** technique for this session.
{{else}}
We'll use a structured approach combining multiple creative thinking techniques.
{{/if}}

### Phase 1: Divergent Thinking (Idea Generation)

Generate as many ideas as possible without judgment:

- **Conventional Ideas**: Standard or obvious approaches
- **Innovative Ideas**: Creative or unconventional solutions
- **Wild Ideas**: Bold, ambitious, or seemingly impractical concepts
- **Adjacent Ideas**: Related or tangential possibilities

### Phase 2: Idea Clustering

Group related ideas into themes or categories:

- Identify patterns and connections
- Find complementary ideas that could be combined
- Note any recurring themes

### Phase 3: Convergent Thinking (Evaluation)

Evaluate and refine the most promising ideas:

- **Feasibility**: How practical is implementation?
- **Impact**: What's the potential benefit?
- **Effort**: What resources would be required?
- **Risk**: What are potential downsides or challenges?

### Phase 4: Recommendations

Provide actionable recommendations:

- **Top 3 Ideas**: Most promising solutions with rationale
- **Quick Wins**: Ideas that could be implemented immediately
- **Long-term Opportunities**: Ideas requiring more research or resources
- **Next Steps**: Concrete actions to move forward

## Output Format

Please structure your response with clear headings, bullet points, and brief explanations for each idea. Make it easy to scan and review later.

Let's begin brainstorming!

---
name: meeting-notes
description: Formats and structures meeting notes with clear action items, decisions, and follow-ups
tags:
  - meeting
  - notes
  - documentation
  - organization
arguments:
  - name: notes
    description: Raw meeting notes, transcript, or bullet points from the meeting
    required: true
  - name: meeting_title
    description: Title or subject of the meeting
    required: false
  - name: attendees
    description: List of meeting attendees
    required: false
  - name: date
    description: Meeting date
    required: false
---

# Meeting Notes Formatter

Transform raw meeting notes into a well-structured, actionable document.

{{#if meeting_title}}

## Meeting: {{meeting_title}}

{{else}}

## Meeting Notes

{{/if}}

{{#if date}}
**Date:** {{date}}
{{/if}}

{{#if attendees}}
**Attendees:** {{attendees}}
{{/if}}

---

Please analyze the following raw meeting notes and create a structured document with these sections:

### 1. Executive Summary

- Brief overview of the meeting (2-3 sentences)
- Key outcomes or takeaways

### 2. Discussion Topics

For each major topic discussed:

- **Topic Name**
  - Key points raised
  - Different perspectives or opinions
  - Questions asked
  - Relevant context or background

### 3. Decisions Made

List all decisions with:

- Clear statement of what was decided
- Who made or approved the decision
- Rationale (if discussed)
- Impact or implications

### 4. Action Items

Create a clear action items list:

- [ ] **Action description** - Assigned to [Person] - Due date: [Date]
- Include priority level if discussed (High/Medium/Low)
- Note any dependencies between action items

### 5. Parking Lot

Topics mentioned but deferred for future discussion:

- Topic name and brief description
- Reason for deferring
- Suggested timeline for follow-up

### 6. Next Steps

- Date/time of next meeting (if scheduled)
- Preparation required for next meeting
- Who is responsible for circulating these notes

### 7. Open Questions

- Unanswered questions that need follow-up
- Who will investigate or answer
- Deadline for response

---

**Raw Meeting Notes:**
{{notes}}

---

Please format these notes following the structure above. Ensure action items are clear, specific, and assignable. Highlight critical decisions and deadlines.

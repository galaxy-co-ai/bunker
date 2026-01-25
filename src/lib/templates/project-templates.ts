// Project framework document templates
// These templates are seeded into new projects to provide structure

export interface DocTemplate {
  name: string;
  docType: "brief" | "prd" | "tad" | "other";
  folder: "planning" | "building" | "shipping";
  content: string;
}

export const PROJECT_TEMPLATES: DocTemplate[] = [
  // ===== PLANNING FOLDER =====
  {
    name: "Project Brief",
    docType: "brief",
    folder: "planning",
    content: `# Project Brief

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked

---

## Problem Statement

[WHO] experiences [WHAT PROBLEM] when [SITUATION].

This causes [NEGATIVE OUTCOME] resulting in [MEASURABLE IMPACT].

Current solutions fail because [REASON].

---

## Vision

[ONE SENTENCE describing the end state when this project succeeds.]

When complete, users will be able to [CAPABILITY] without [CURRENT FRICTION].

---

## Success Metrics

| Metric | Current State | Target | Measurement Method |
|--------|---------------|--------|-------------------|
| [Metric 1] | [Baseline or N/A] | [Goal] | [How measured] |
| [Metric 2] | [Baseline or N/A] | [Goal] | [How measured] |
| [Metric 3] | [Baseline or N/A] | [Goal] | [How measured] |

---

## Scope

### In Scope

- [Feature/capability 1]
- [Feature/capability 2]
- [Feature/capability 3]
- [Feature/capability 4]

### Out of Scope

- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Explicitly excluded item 3]

### Deferred to Future

- [Item for v2] — v2
- [Item for v2] — v2
- [Item for v3] — v3

---

## Assumptions

| Assumption | Risk if Wrong | Mitigation |
|------------|---------------|------------|
| [Assumption 1] | [Impact if false] | [Backup plan] |
| [Assumption 2] | [Impact if false] | [Backup plan] |
| [Assumption 3] | [Impact if false] | [Backup plan] |

---

## Constraints

| Type | Constraint | Rationale |
|------|------------|-----------|
| Time | [Deadline or timeline] | [Why this limit exists] |
| Budget | [Amount or "Solo/bootstrap"] | [Why this limit exists] |
| Technical | [Technical limitation] | [Why this limit exists] |
| Resource | [Resource limitation] | [Why this limit exists] |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Problem Statement identifies specific user and quantified impact
- [ ] Vision is achievable and ties to Problem Statement
- [ ] All Success Metrics are measurable post-launch
- [ ] Scope has explicit Out of Scope items (not empty)
- [ ] All Assumptions have mitigation paths
- [ ] All Constraints have rationale
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of Project Brief**`,
  },
  {
    name: "PRD",
    docType: "prd",
    folder: "planning",
    content: `# Product Requirements Document (PRD)

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**Brief Reference:** [Link to Project Brief]

---

## User Personas

### Persona: [Name]

| Attribute | Description |
|-----------|-------------|
| **Role** | [Job title/description] |
| **Goals** | [What they're trying to accomplish] |
| **Pain Points** | [Current frustrations] |
| **Technical Proficiency** | Low / Medium / High |
| **Usage Frequency** | Daily / Weekly / Monthly |

---

## User Stories

### Epic: [Epic Name]

---

#### Story US-001: [Title]

**As a** [persona],
**I want** [capability],
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1 — binary, testable]
- [ ] [Criterion 2 — binary, testable]
- [ ] [Criterion 3 — binary, testable]

---

## Feature List

### Must Have (MVP)

| ID | Feature | User Story | Complexity | Notes |
|----|---------|------------|------------|-------|
| F1 | [Feature name] | US-001 | S / M / L / XL | |
| F2 | [Feature name] | US-001 | S / M / L / XL | |
| F3 | [Feature name] | US-002 | S / M / L / XL | |

### Should Have (v1.1)

| ID | Feature | User Story | Complexity | Notes |
|----|---------|------------|------------|-------|
| F4 | [Feature name] | US-003 | S / M / L / XL | |

### Won't Have (Explicitly Excluded)

| Feature | Reason for Exclusion |
|---------|----------------------|
| [Feature name] | [Why not included] |

---

## Acceptance Criteria Matrix

| Feature ID | Criterion | Test Method | Pass Definition |
|------------|-----------|-------------|-----------------|
| F1 | [Criterion from US-001] | Manual / Auto | [What constitutes pass] |

---

## Dependencies

| Dependency | Type | Owner | Risk Level | Fallback |
|------------|------|-------|------------|----------|
| [External API/Service] | External API | [Company/Team] | Low / Med / High | [Alternative approach] |

---

## Edge Cases

| Feature ID | Edge Case | Expected Behavior |
|------------|-----------|-------------------|
| F1 | [Exception scenario] | [How system responds] |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Every persona appears in at least one User Story
- [ ] Every User Story has ≥2 acceptance criteria
- [ ] Every Feature has an ID and traces to a User Story
- [ ] "Won't Have" section is populated (not empty)
- [ ] Every acceptance criterion has a Pass Definition
- [ ] Every dependency has a Fallback or explicit risk acceptance
- [ ] All edge cases have Expected Behavior defined
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of PRD**`,
  },
  {
    name: "Technical Architecture",
    docType: "tad",
    folder: "planning",
    content: `# Technical Architecture Document (TAD)

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**PRD Reference:** [Link to PRD]

---

## System Overview

### Architecture Diagram

\`\`\`
[Include Mermaid diagram, ASCII art, or link to image]

Example structure:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (Next.js)  │     │  (Node.js)  │     │  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

### System Description

[2-3 paragraphs describing the overall architecture, data flow, and key design principles.]

### Key Architectural Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| [Decision 1] | [Option A, B, C] | [Choice] | [Why this was chosen] |

---

## Tech Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Frontend | [Framework] | [x.x.x] | [Project-specific reason] |
| Backend | [Framework] | [x.x.x] | [Project-specific reason] |
| Database | [DB] | [x.x.x] | [Project-specific reason] |
| ORM/Query | [Tool] | [x.x.x] | [Project-specific reason] |
| Hosting | [Platform] | [N/A] | [Project-specific reason] |

---

## Component Design

### Component: [Name]

**ID:** C1
**Responsibility:** [Single sentence — what this component owns]

**Interfaces:**
- **Input:** [What it receives, from where]
- **Output:** [What it produces, to where]

**Dependencies:**
- [Component/service this depends on]

**Key Implementation Notes:**
- [Important detail for implementer]

---

## Data Design

### Entity Relationship Diagram

\`\`\`
[Include ERD — Mermaid, ASCII, or image link]
\`\`\`

### Schema Definitions

#### Table: [Table Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| [column] | [type] | [constraints] | [description] |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

---

## API Design

### POST /api/[resource]

**Purpose:** [What this endpoint does]
**Auth:** Required / Public / Admin-only

**Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| [field] | [type] | Yes | [description] |

**Response (201):**

\`\`\`json
{
  "id": "uuid — Created resource ID"
}
\`\`\`

**Error Responses:**

| Code | Condition | Response |
|------|-----------|----------|
| 400 | Invalid input | \`{ "error": "Validation failed" }\` |

---

## Security Model

### Authentication

| Attribute | Value |
|-----------|-------|
| Method | [JWT / Session / OAuth / etc.] |
| Token Lifetime | [Duration] |

### Authorization

| Role | Permissions |
|------|-------------|
| [Role 1] | [What they can access/do] |

---

## Error Handling

### Error Categories

| Category | Example | Handling Strategy | User Message |
|----------|---------|-------------------|--------------|
| Validation | Invalid email format | Return 400, list errors | "Please check your input" |
| System | Database connection lost | Retry 3x, log, alert | "Something went wrong" |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Architecture diagram exists and matches description
- [ ] Every technology has a version and justification
- [ ] Every component has an ID for MTS traceability
- [ ] All database tables are defined with all fields
- [ ] Every API endpoint is fully specified
- [ ] Security model covers auth and authorization
- [ ] Error handling covers all categories
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of TAD**`,
  },
  {
    name: "Agent Crew Spec",
    docType: "other",
    folder: "planning",
    content: `# Agent Crew Specification

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**TAD Reference:** [Link to TAD]

---

## Crew Overview

### Agent Roster

| ID | Name | Role | Primary Interactions |
|----|------|------|---------------------|
| A1 | [Agent Name] | [One-line role] | [A2, A3] |
| A2 | [Agent Name] | [One-line role] | [A1, A3] |

### Workflow Diagram

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Architect  │────▶│  Developer  │────▶│    QA       │
│    (A1)     │     │    (A2)     │     │   (A3)      │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

---

## Agent Constitutions

## Agent A1: [Agent Name]

### Identity

| Attribute | Value |
|-----------|-------|
| **ID** | A1 |
| **Name** | [Agent Name] |
| **Role** | [Single sentence describing function] |
| **Domain** | [Narrow area of expertise] |

### Responsibilities

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

### Boundaries

What this agent explicitly DOES NOT do.

- [Exclusion 1]
- [Exclusion 2]

### Tools & Access

| Tool/Resource | Access Level | Purpose |
|---------------|--------------|---------|
| [Tool 1] | Read / Write / Execute | [Why needed] |

### Handoff Rules

| Condition | Handoff To | Data Passed |
|-----------|------------|-------------|
| [Trigger condition 1] | [Agent ID] | [What gets transferred] |
| [Needs human decision] | Human | [Context for decision] |

### Failure Behavior

1. **Attempt self-resolution** — [Specific actions to try]
2. **Log the blocker** — Document issue in Decision Log
3. **Notify supervisor** — Alert [Agent ID or Human]
4. **Pause and await input** — Do not proceed without resolution

### Quality Standards

- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]
- [ ] Output follows Output Protocol format
- [ ] No work outside defined Responsibilities

---

## Coordination Rules

### Conflict Resolution

When agents disagree or overlap:

1. **Check Responsibilities** — Refer to each agent's defined scope
2. **Check Boundaries** — If in one agent's exclusion list, other agent owns it
3. **Consult TAD** — Architecture document is authoritative on technical decisions
4. **Escalate to Human** — If still unclear after steps 1-3

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Every agent has a unique ID
- [ ] No two agents have overlapping responsibilities
- [ ] Every agent has explicit boundaries (not empty)
- [ ] Every agent has handoff rules
- [ ] Every agent has failure behavior defined
- [ ] Coordination rules cover conflict resolution
- [ ] Escalation path to human is clear
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of Agent Crew Specification**`,
  },
  {
    name: "Master Task Sequence",
    docType: "other",
    folder: "planning",
    content: `# Master Task Sequence (MTS)

**Project:** [Project Name]
**Version:** 1.0
**Generated:** [Date]
**Last Modified:** [Date]
**Total Tasks:** [Number]
**Status:** Draft | Locked | In Progress | Complete

---

## Generation Log

### PRD Feature → Task Mapping

| Feature ID | Feature Name | Tasks |
|------------|--------------|-------|
| F1 | [Feature Name] | Tasks #-# |
| F2 | [Feature Name] | Tasks #-# |

### TAD Component → Task Mapping

| Component ID | Component Name | Tasks |
|--------------|----------------|-------|
| C1 | [Component Name] | Tasks #-# |
| C2 | [Component Name] | Tasks #-# |

---

## Task Sequence

## Phase 1: Foundation (Tasks 1-[N])

Goal: Project scaffolding, dependencies, and base configuration.

---

### Task 1: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]
**Depends:** None
**Source:** Infrastructure
**Estimate:** S

---

### Task 2: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]
**Depends:** Task 1
**Source:** Infrastructure
**Estimate:** S

---

## Phase 2: Core Features (Tasks [N+1]-[M])

Goal: Implement MVP functionality.

---

### Task [N+1]: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]
**Depends:** Task [N]
**Source:** PRD-F1
**Estimate:** M

---

## Phase 3: Polish & Ship (Tasks [P+1]-[Final])

Goal: Testing, documentation, deployment.

---

### Task [Final]: Project complete

**Acceptance:** Ship Checklist passes 100%
**Depends:** Task [Final-1]
**Source:** Framework
**Estimate:** S

---

## Validation Checklist (Pre-Lock)

Before locking MTS, verify:

- [ ] Every PRD feature maps to ≥1 task
- [ ] Every TAD component maps to ≥1 task
- [ ] Task dependencies form unbroken chain (no orphans)
- [ ] Every acceptance criterion is binary (pass/fail)
- [ ] No task requires agent to invent sub-steps
- [ ] Final task is "Project complete" with Ship Checklist as acceptance

---

**End of MTS**`,
  },
  {
    name: "Audit Checklist",
    docType: "other",
    folder: "planning",
    content: `# Audit Checklist

**Project:** [Project Name]
**Audit Date:** [Date]
**Auditor:** [Name]
**Version:** 1.0

---

## Audit Summary

| Category | Weight | Score | Weighted Score |
|----------|--------|-------|----------------|
| Project Brief | 15% | /100 | |
| PRD | 25% | /100 | |
| TAD | 25% | /100 | |
| Agent Crew Spec | 15% | /100 | |
| MTS | 20% | /100 | |
| **TOTAL** | **100%** | | **[SCORE]** |

**Threshold:** 100% required to proceed to building.

---

## Document Audits

### Project Brief Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Problem Statement identifies specific user | [ ] |
| 2 | Problem Statement quantifies impact | [ ] |
| 3 | Vision is ≤2 sentences | [ ] |
| 4 | Vision ties to Problem Statement | [ ] |
| 5 | ≥2 Success Metrics defined | [ ] |
| 6 | All Success Metrics are measurable | [ ] |
| 7 | In Scope section populated | [ ] |
| 8 | Out of Scope section populated (not empty) | [ ] |
| 9 | All Assumptions have Mitigation | [ ] |
| 10 | All Constraints have Rationale | [ ] |
| 11 | No TBDs or placeholders | [ ] |

**Score:** [X] / 11 = [Y]%

---

### PRD Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | ≥1 User Persona defined | [ ] |
| 2 | Every User Story has ≥2 Acceptance Criteria | [ ] |
| 3 | All Acceptance Criteria are binary (pass/fail) | [ ] |
| 4 | Every Feature has ID | [ ] |
| 5 | Every Feature traces to User Story | [ ] |
| 6 | Must Have features defined | [ ] |
| 7 | Won't Have section populated (not empty) | [ ] |
| 8 | All Dependencies have Fallback | [ ] |
| 9 | All Edge Cases have Expected Behavior | [ ] |
| 10 | No TBDs or placeholders | [ ] |

**Score:** [X] / 10 = [Y]%

---

### TAD Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Architecture diagram exists | [ ] |
| 2 | Every tech stack item has version | [ ] |
| 3 | Every Component has ID | [ ] |
| 4 | Every Component has interfaces | [ ] |
| 5 | All database tables defined | [ ] |
| 6 | Every API endpoint fully specified | [ ] |
| 7 | Security model covers auth | [ ] |
| 8 | Error handling covers all categories | [ ] |
| 9 | No TBDs or placeholders | [ ] |

**Score:** [X] / 9 = [Y]%

---

## Final Verdict

| Score Range | Result | Action |
|-------------|--------|--------|
| 100% | ✅ PASS | Proceed to building |
| 95-99% | ⚠️ CONDITIONAL | Fix minor gaps, re-audit |
| <95% | ❌ FAIL | Return to planning |

**Total Score:** [X]%

**Verdict:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

---

**End of Audit Checklist**`,
  },

  // ===== BUILDING FOLDER =====
  {
    name: "Project Pulse",
    docType: "other",
    folder: "building",
    content: `# Project Pulse

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD HH:MM]
**Updated By:** [Agent/Human Name]

---

## Current Position

| Field | Value |
|-------|-------|
| **Current Task** | [#] of [Total] |
| **Task Name** | [Full task name from MTS] |
| **Status** | In Progress / Blocked / Waiting for Review |
| **Started** | [YYYY-MM-DD HH:MM] |
| **Notes** | [Any relevant context] |

---

## Last Completed

| Field | Value |
|-------|-------|
| **Task** | [#] — [Task Name] |
| **Completed** | [YYYY-MM-DD HH:MM] |
| **Duration** | [Time taken] |
| **Notes** | [Learnings, issues, or "Clean completion"] |

---

## Next Up

| Field | Value |
|-------|-------|
| **Task** | [#+1] — [Task Name] |
| **Depends On** | Task [#] (current) |
| **Estimate** | [S/M/L or hours] |
| **Prep Needed** | [Setup required or "None"] |

---

## Blockers

| Blocker | Blocking Task | Owner | Status | Notes |
|---------|---------------|-------|--------|-------|
| None | — | — | — | — |

---

## Recent Decisions

Last 5 decisions affecting the project. Full details in Decision Log.

| ID | Summary | MTS Impact |
|----|---------|------------|
| — | No decisions yet | — |

---

## Quick Links

| Document | Location |
|----------|----------|
| Master Task Sequence | [Link or path] |
| Decision Log | [Link or path] |
| Test Plan | [Link or path] |
| PRD | [Link or path] |
| TAD | [Link or path] |

---

## Recovery Protocol

If you're reading this after a gap, follow this sequence:

1. **Read this document** — You now know current state
2. **Check Blockers** — If blocked, resolve before proceeding
3. **Open MTS** — Read current task details
4. **Check Decision Log** — Scan recent entries for context
5. **Resume current task** — Or start next if current is complete

---

**End of Project Pulse**`,
  },
  {
    name: "Decision Log",
    docType: "other",
    folder: "building",
    content: `# Decision Log

**Project:** [Project Name]
**Created:** [Date]
**Last Entry:** [Date]
**Total Decisions:** [Count]

---

## Log Purpose

This document tracks every deviation from the original plan during build.

**Entry Triggers — log when:**
- Architecture changes from TAD
- Scope changes (feature added or cut)
- Tech stack changes
- Process changes
- Bug workaround affects design
- Assumption proved wrong
- Unexpected dependency discovered
- Performance issue requires redesign

**Rule:** If it changes what we planned, it goes in the log.

---

## Decision Entries

---

### Decision D001: [Title]

**Date:** [Date]
**Author:** [Who made/proposed this]
**Status:** Proposed | Approved | Implemented | Reverted

**Trigger:**
[What caused this decision to be needed? What broke or changed?]

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Option A | [Advantages] | [Disadvantages] |
| Option B | [Advantages] | [Disadvantages] |

**Decision:**
[Which option was chosen]

**Rationale:**
[Why this option was selected over others]

**MTS Impact:**
- Tasks added: [Task numbers or "None"]
- Tasks removed: [Task numbers or "None"]
- Tasks modified: [Task numbers with description or "None"]

**Other Doc Impact:**

| Document | Section | Change |
|----------|---------|--------|
| [Doc name] | [Section] | [What changed] |

---

## Category Summary

| Category | Count | Decision IDs | Notes |
|----------|-------|--------------|-------|
| Architecture | 0 | — | Changes to system design |
| Scope Change | 0 | — | Features added or cut |
| Tech Stack | 0 | — | Technology swaps |
| Process | 0 | — | How we work |
| Bug Workaround | 0 | — | Design changes due to bugs |
| **Total** | **0** | | |

---

## Scope Change Tracker

| Decision ID | Change Description | Direction | Features Affected |
|-------------|-------------------|-----------|-------------------|
| — | No scope changes yet | — | — |

**Net Scope Change:** +0 / -0 features from original PRD

---

## Lessons Learned

| Lesson | Decision(s) | Recommendation for Future |
|--------|-------------|---------------------------|
| [Insight] | [D### reference] | [What to do differently] |

---

**End of Decision Log**`,
  },
  {
    name: "Test Plan",
    docType: "other",
    folder: "building",
    content: `# Test Plan

**Project:** [Project Name]
**Version:** 1.0
**Generated:** [Date]
**Last Updated:** [Date]
**PRD Reference:** [Link to PRD]
**MTS Reference:** [Link to MTS]

---

## Test Strategy

| Test Type | Coverage Target | Automation | Responsibility |
|-----------|-----------------|------------|----------------|
| Unit | 80%+ code coverage | Required | Developer |
| Integration | All API endpoints | Required | Developer |
| E2E | All critical paths | Required | QA/Developer |
| Performance | Key operations | As needed | QA |
| Security | Auth + data flows | Required | Security review |

### Test Priorities

1. **Critical Path** — User can complete core workflow
2. **Happy Path** — Standard use cases work
3. **Error Handling** — System fails gracefully
4. **Edge Cases** — Boundary conditions handled

---

## Coverage Matrix

| Feature ID | Feature | Unit | Integration | E2E | Status |
|------------|---------|------|-------------|-----|--------|
| F1 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F2 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |

**Status Legend:**
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked

---

## Test Cases by Feature

### Feature: F1 — [Feature Name]

**Source:** PRD-F1

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F1-T01 | [From acceptance criterion 1] | Unit | [Input] | [Output] | ⬜ |
| F1-T02 | [From acceptance criterion 2] | Integration | [Input] | [Output] | ⬜ |

**Edge Case Tests:**

| Test ID | Edge Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| F1-E01 | [Edge case from PRD] | [Expected behavior] | ⬜ |

---

## Performance Benchmarks

| Operation | Target | Acceptable | Unacceptable | Test Method |
|-----------|--------|------------|--------------|-------------|
| Page load | < 2s | < 4s | > 4s | Lighthouse |
| API response (p95) | < 200ms | < 500ms | > 500ms | Load test |

---

## Security Tests

| Test ID | Test | Description | Method | Status |
|---------|------|-------------|--------|--------|
| SEC-01 | Authentication bypass | Attempt access without token | Manual + Auto | ⬜ |
| SEC-02 | SQL injection | Standard injection vectors | Auto (OWASP) | ⬜ |
| SEC-03 | XSS | Cross-site scripting vectors | Auto | ⬜ |

---

## Test Environment

| Environment | Purpose | Data | URL | Notes |
|-------------|---------|------|-----|-------|
| Local | Development | Mock/Seed | localhost:3000 | Individual dev |
| CI | Automated tests | Mock | N/A | GitHub Actions |
| Staging | Integration | Sanitized prod | [URL] | Pre-prod mirror |

---

## Test Execution Checklist

### Before Each Sprint

- [ ] All existing tests passing
- [ ] New feature tests written for sprint scope
- [ ] Test environment healthy

### Before Ship

- [ ] 100% of test cases pass
- [ ] Security test suite pass
- [ ] Performance benchmarks met
- [ ] No critical/major bugs open

---

**End of Test Plan**`,
  },

  // ===== SHIPPING FOLDER =====
  {
    name: "Ship Checklist",
    docType: "other",
    folder: "shipping",
    content: `# Ship Checklist

**Project:** [Project Name]
**Target Ship Date:** [Date]
**Checklist Date:** [Date]
**Reviewer:** [Name]

---

## Functional Completeness

All features work as specified.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All MTS tasks marked complete | ⬜ | |
| 2 | All PRD Must-Have features implemented | ⬜ | |
| 3 | All PRD acceptance criteria verified | ⬜ | |
| 4 | All User Stories satisfied | ⬜ | |
| 5 | No missing functionality in critical path | ⬜ | |

**Functional Completeness:** ⬜ Pass | ⬜ Fail

---

## Quality

Product is stable and performant.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All unit tests passing | ⬜ | |
| 2 | All integration tests passing | ⬜ | |
| 3 | All E2E tests passing | ⬜ | |
| 4 | No critical bugs open | ⬜ | |
| 5 | No major bugs open | ⬜ | |
| 6 | Performance benchmarks met | ⬜ | |

**Quality:** ⬜ Pass | ⬜ Fail

---

## Documentation

Users and maintainers can understand the product.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | User documentation complete | ⬜ | |
| 2 | API documentation complete | ⬜ | |
| 3 | README up to date | ⬜ | |
| 4 | Environment setup documented | ⬜ | |
| 5 | Deployment process documented | ⬜ | |

**Documentation:** ⬜ Pass | ⬜ Fail

---

## Operational Readiness

We can run and maintain this in production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Production environment configured | ⬜ | |
| 2 | Environment variables documented and set | ⬜ | |
| 3 | Database migrations ready | ⬜ | |
| 4 | Monitoring configured | ⬜ | |
| 5 | Backup procedure documented | ⬜ | |
| 6 | SSL/TLS configured | ⬜ | |
| 7 | Domain/DNS configured | ⬜ | |

**Operational Readiness:** ⬜ Pass | ⬜ Fail

---

## Security

Product is secure for production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Authentication working correctly | ⬜ | |
| 2 | Authorization working correctly | ⬜ | |
| 3 | No sensitive data in logs | ⬜ | |
| 4 | HTTPS enforced | ⬜ | |
| 5 | CORS properly configured | ⬜ | |
| 6 | No hardcoded secrets in code | ⬜ | |

**Security:** ⬜ Pass | ⬜ Fail

---

## Final Checks

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Staging deployment successful | ⬜ | |
| 2 | Staging smoke tests pass | ⬜ | |
| 3 | Decision Log reviewed for open items | ⬜ | |

**Final Checks:** ⬜ Pass | ⬜ Fail

---

## Ship Verdict

### Summary

| Section | Status |
|---------|--------|
| Functional Completeness | ⬜ Pass / ⬜ Fail |
| Quality | ⬜ Pass / ⬜ Fail |
| Documentation | ⬜ Pass / ⬜ Fail |
| Operational Readiness | ⬜ Pass / ⬜ Fail |
| Security | ⬜ Pass / ⬜ Fail |
| Final Checks | ⬜ Pass / ⬜ Fail |

### Verdict

**All sections pass?**

- ⬜ **SHIP** — Deploy to production
- ⬜ **NO SHIP** — Address failures below

---

## Post-Ship Actions

Complete after successful deployment:

- [ ] Production deployment confirmed
- [ ] Health checks passing
- [ ] Monitoring showing expected metrics
- [ ] First real user transaction successful
- [ ] Team notified of ship
- [ ] Project Pulse updated to "Complete"
- [ ] Retrospective scheduled

---

**End of Ship Checklist**`,
  },
];

# Project Framework v2

**Version:** 2.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Active — Locked

---

## Philosophy

**The framework's job is to produce a complete, executable task list.**

If planning doesn't end with a numbered sequence an agent can execute without inventing steps — planning isn't done.

The test: When the agent stops leading and starts offering menus, the docs have failed.

---

## Framework Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT FRAMEWORK v2                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PLANNING (Locked after audit)                                  │
│  ────────────────────────────                                   │
│  1. Project Brief      → Why we're building                     │
│  2. PRD                → What we're building                    │
│  3. TAD                → How it's architected                   │
│  4. Agent Crew Spec    → Who does what (AI agents)              │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│  GATE: Planning Audit (must hit 100%)                           │
│  ─────────────────────────────────────                          │
│  5. Audit Checklist    → Validates planning completeness        │
│                        → ALSO validates MTS is complete         │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│  THE BRIDGE (Generated from PRD + TAD)                          │
│  ─────────────────────────────────────                          │
│  6. Master Task Sequence (MTS)                                  │
│     → Every task, numbered, from first file to production       │
│     → This is the backbone. No gaps. No ambiguity.              │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│  BUILDING (Living docs)                                         │
│  ──────────────────────                                         │
│  7. Project Pulse      → Current state (always updated)         │
│  8. Test Plan          → Verification strategy                  │
│  9. Decision Log       → All changes from plan                  │
│                                                                 │
│                        ↓                                        │
│                                                                 │
│  GATE: Ship Readiness                                           │
│  ────────────────────                                           │
│  10. Ship Checklist    → Final validation before deploy         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Document Registry

### Complete List

| # | Document | Single Job | Created | Updates |
|---|----------|-----------|---------|---------|
| 1 | **Project Brief** | Define the problem and constraints | Planning | Never (locked) |
| 2 | **PRD** | Define features + acceptance criteria | Planning | Never (locked) |
| 3 | **TAD** | Define architecture + tech decisions | Planning | Never (locked) |
| 4 | **Agent Crew Spec** | Define each agent's constitution | Planning | Never (locked) |
| 5 | **Audit Checklist** | Validate planning is complete + MTS is executable | End of planning | Once |
| 6 | **Master Task Sequence** | List every task from start to ship | Generated from PRD+TAD | Only via Change Protocol |
| 7 | **Project Pulse** | Show current state (task #, blockers, next action) | Building starts | Continuous |
| 8 | **Test Plan** | Define how we verify each feature works | Generated from PRD | When MTS changes |
| 9 | **Decision Log** | Track every deviation from plan | Building starts | Continuous |
| 10 | **Ship Checklist** | Validate we're ready to deploy | Pre-ship | Once |

---

## Document Definitions

### Planning Phase (Locked After Audit)

#### 1. Project Brief
**Single Job:** Define why we're building this.

Contains:
- Problem statement
- Vision
- Success metrics
- Scope boundaries (in/out)
- Assumptions
- Constraints

**Lock Rule:** Cannot change after audit passes.

---

#### 2. Product Requirements Document (PRD)
**Single Job:** Define what we're building.

Contains:
- User personas
- User stories with acceptance criteria
- Feature list (prioritized)
- Dependencies
- Edge cases

**Lock Rule:** Cannot change after audit passes.

---

#### 3. Technical Architecture Document (TAD)
**Single Job:** Define how it's architected.

Contains:
- System overview + diagram
- Tech stack with justifications
- Component design
- Data design
- API design
- Security model
- Error handling strategy

**Lock Rule:** Cannot change after audit passes.

---

#### 4. Agent Crew Specification
**Single Job:** Define who does what (AI agents).

Contains per agent:
- Identity and role
- Responsibilities (exhaustive)
- Boundaries (explicit exclusions)
- Tools and access
- Input/output protocols
- Handoff rules
- Failure behavior
- Quality standards

**Lock Rule:** Cannot change after audit passes.

---

### Gate: Planning Audit

#### 5. Audit Checklist
**Single Job:** Validate planning is complete AND MTS is executable.

Validates:
- All planning docs complete (no TBDs)
- No contradictions between docs
- All features have acceptance criteria
- All agents have complete constitutions
- **MTS exists and is executable without gaps**

**Threshold:** 100% required to proceed.

**Pass Criteria:**
- An agent can read the MTS and execute it without inventing steps
- Every task has clear completion criteria
- No ambiguity in task sequence

---

### The Bridge

#### 6. Master Task Sequence (MTS)
**Single Job:** List every task from first file to production deploy.

**This is the backbone of the entire framework.**

Format:
```
Task [#]: [Action]
Acceptance: [How to verify this task is complete]
Depends on: [Previous task # or "None"]
```

Example:
```
Task 1: Create project directory structure
Acceptance: Folders exist: /src, /tests, /docs, /config
Depends on: None

Task 2: Initialize package.json
Acceptance: package.json exists with project name and version
Depends on: Task 1

Task 3: Install core dependencies
Acceptance: node_modules created, dependencies in package.json
Depends on: Task 2

...

Task 87: Deploy to production
Acceptance: App accessible at production URL, health check returns 200
Depends on: Task 86

Task 88: Verify production monitoring
Acceptance: Logs appearing in monitoring dashboard
Depends on: Task 87

Task 89: Project complete
Acceptance: Ship Checklist passes 100%
Depends on: Task 88
```

**Generation Rule:** MTS is generated FROM PRD + TAD at end of planning. Every feature in PRD must map to tasks in MTS. Every component in TAD must have implementation tasks in MTS.

**Update Rule:** Only via Change Protocol (see below).

---

### Building Phase (Living Docs)

#### 7. Project Pulse
**Single Job:** Show current state at all times.

Format:
```markdown
## Project Pulse

**Project:** [Name]
**Last Updated:** [Timestamp]

### Current Position
- **Current Task:** [#] of [Total]
- **Task Name:** [Name]
- **Status:** [In Progress / Blocked / Waiting for Approval]

### Last Completed
- **Task:** [#] — [Name]
- **Completed:** [Timestamp]

### Next Up
- **Task:** [#+1] — [Name]

### Blockers
| Blocker | Blocking Task | Owner | Notes |
|---------|---------------|-------|-------|
| [None or description] | | | |

### Quick Links
- [Master Task Sequence](link)
- [Decision Log](link)
- [Test Plan](link)
```

**Update Rule:** Updated after every task completion and whenever status changes.

**Purpose:** Cold-start entry point. Agent reads this, knows exactly where you are.

---

#### 8. Test Plan
**Single Job:** Define how we verify each feature works.

Contains:
- Test coverage matrix (feature → tests)
- Test cases per feature (from PRD acceptance criteria)
- Agent-specific test suites
- Performance benchmarks
- Security tests

**Generation Rule:** Each acceptance criterion in PRD becomes a test case.

**Update Rule:** When MTS changes via Change Protocol.

---

#### 9. Decision Log
**Single Job:** Track every deviation from the plan.

Format per entry:
```markdown
### Decision [D###]: [Title]

**Date:** [Date]
**Trigger:** [What caused this decision]

**Change:**
[What changed from original plan]

**Rationale:**
[Why this change was necessary]

**MTS Impact:**
- Tasks added: [List or None]
- Tasks removed: [List or None]
- Tasks modified: [List or None]

**Other Doc Impact:**
- [Document]: [Change made]
```

**Update Rule:** Entry added EVERY time reality diverges from plan.

---

### Gate: Ship Readiness

#### 10. Ship Checklist
**Single Job:** Validate we're ready to deploy.

```markdown
## Ship Checklist

### Functional Completeness
- [ ] All MTS tasks complete
- [ ] All PRD acceptance criteria verified
- [ ] All tests passing

### Quality
- [ ] No critical bugs open
- [ ] Performance benchmarks met
- [ ] Security review passed

### Documentation
- [ ] User documentation complete
- [ ] API documentation complete

### Operational Readiness
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback procedure documented

### Sign-off
- [ ] Final review complete
- [ ] Ready to ship
```

---

## Change Protocol

**When reality breaks the plan, follow this exact sequence:**

### Step 1: Log It
Create Decision Log entry:
- What changed
- Why it changed
- Impact assessment

### Step 2: Update MTS
- Add new tasks (numbered appropriately)
- Remove obsolete tasks
- Modify changed tasks
- Renumber downstream tasks if needed
- Ensure no gaps in sequence

### Step 3: Update Project Pulse
- Reflect new current state
- Update total task count
- Note any new blockers

### Step 4: Update Test Plan (if needed)
- Add tests for new features
- Remove tests for cut features
- Modify tests for changed acceptance criteria

### Step 5: Resume
- Agent picks up from current task in updated MTS
- Continue execution

---

## Framework Validation

### The Framework Works If:

1. **Agent stays on track** — Can read MTS and execute without inventing steps or offering menus
2. **Cold starts work** — Read Project Pulse, know exactly where you are, resume immediately
3. **Changes don't derail** — Change Protocol gets you back on track without "winging it"
4. **Ship happens** — Complete MTS execution = shipped product

### The Framework Failed If:

1. Agent starts offering options instead of leading
2. You return to project and don't know where you are
3. Something changes and you're "winging it"
4. Project stalls mid-build

---

## Migration from v1

### Documents Removed

| Old Doc | Why Removed | Replacement |
|---------|-------------|-------------|
| Sprint Backlog | Too high-level, doesn't prevent mid-build fog | MTS (sprints are just task ranges) |
| Implementation Guide | Vague "phases" don't give agents executable steps | MTS + TAD |

### Documents Added

| New Doc | Why Added |
|---------|-----------|
| Master Task Sequence (MTS) | The missing backbone — executable task list |
| Project Pulse | The missing state doc — always-current position |

### Documents Refined

| Doc | Change |
|-----|--------|
| Audit Checklist | Now validates MTS completeness, not just planning docs |
| Decision Log | Now explicitly tied to Change Protocol |

---

## Quick Reference

### Document Flow
```
Project Brief → PRD → TAD → Agent Crew Spec
                ↓
        Audit Checklist (validates all + MTS)
                ↓
        Master Task Sequence (generated)
                ↓
        Project Pulse ← Decision Log
                ↓
           Test Plan
                ↓
         Ship Checklist
                ↓
            SHIPPED
```

### When Agent Loses Track
1. Check Project Pulse — where are we?
2. Check MTS — what's the current task?
3. If MTS is unclear — Change Protocol triggered incorrectly or MTS has gaps
4. If MTS is clear — agent context issue, reload MTS and Pulse

### Sprints (Optional Overlay)
Sprints are just slices of MTS:
- Sprint 1: Tasks 1-25
- Sprint 2: Tasks 26-50
- Sprint 3: Tasks 51-89

Not a separate document. Just a view into MTS.

---

**End of Framework v2**

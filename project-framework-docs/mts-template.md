# Master Task Sequence (MTS)

**Project:** [Project Name]  
**Version:** 1.0  
**Generated:** [Date]  
**Last Modified:** [Date]  
**Total Tasks:** [Number]  
**Status:** Draft | Locked | In Progress | Complete

---

## Generation Log

This section proves complete traceability from planning docs to tasks.

### PRD Feature → Task Mapping

| Feature ID | Feature Name | Tasks |
|------------|--------------|-------|
| F1 | [Feature Name] | Tasks #-# |
| F2 | [Feature Name] | Tasks #-# |
| F3 | [Feature Name] | Tasks #-# |

### TAD Component → Task Mapping

| Component ID | Component Name | Tasks |
|--------------|----------------|-------|
| C1 | [Component Name] | Tasks #-# |
| C2 | [Component Name] | Tasks #-# |
| C3 | [Component Name] | Tasks #-# |

### Infrastructure Tasks

Tasks not tied to specific features/components:

| Category | Tasks |
|----------|-------|
| Project Setup | Tasks #-# |
| CI/CD | Tasks #-# |
| Deployment | Tasks #-# |
| Documentation | Tasks #-# |

---

## Task Sequence

---

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

### Task 3: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]  
**Depends:** Task 2  
**Source:** TAD-C1  
**Estimate:** M

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

[Continue pattern for all tasks...]

---

## Phase 3: Integration (Tasks [M+1]-[P])

Goal: Connect components, end-to-end flows working.

---

### Task [M+1]: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]  
**Depends:** Task [M]  
**Source:** TAD-C5  
**Estimate:** L

---

[Continue pattern...]

---

## Phase 4: Polish & Ship (Tasks [P+1]-[Final])

Goal: Testing, documentation, deployment.

---

### Task [P+1]: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]  
**Depends:** Task [P]  
**Source:** Infrastructure  
**Estimate:** M

---

### Task [Final-1]: Deploy to production

**Acceptance:** Application accessible at production URL, health check returns 200  
**Depends:** Task [Final-2]  
**Source:** Infrastructure  
**Estimate:** M

---

### Task [Final]: Project complete

**Acceptance:** Ship Checklist passes 100%  
**Depends:** Task [Final-1]  
**Source:** Framework  
**Estimate:** S

---

## Change History

Changes to MTS after initial lock are recorded here via Change Protocol.

---

### Change C001 — [Date]

**Trigger:** [What caused this change]  
**Decision Log Entry:** D001  
**Tasks Added:** [Task numbers or "None"]  
**Tasks Removed:** [Task numbers or "None"]  
**Tasks Modified:** [Task numbers or "None"]  
**Net Change:** [+N/-N tasks]

---

[Additional changes follow same format]

---

## Validation Checklist (Pre-Lock)

Before locking MTS, verify:

- [ ] Every PRD feature maps to ≥1 task
- [ ] Every TAD component maps to ≥1 task
- [ ] Every task has a Source (PRD-F#, TAD-C#, or Infrastructure)
- [ ] Task dependencies form unbroken chain (no orphans)
- [ ] Every acceptance criterion is binary (pass/fail)
- [ ] No task requires agent to invent sub-steps
- [ ] Final task is "Project complete" with Ship Checklist as acceptance
- [ ] Total task count matches header

---

**End of MTS**

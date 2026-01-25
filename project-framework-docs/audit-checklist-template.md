# Audit Checklist

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
| 3 | Problem Statement explains why current solutions fail | [ ] |
| 4 | Vision is ≤2 sentences | [ ] |
| 5 | Vision ties to Problem Statement | [ ] |
| 6 | ≥2 Success Metrics defined | [ ] |
| 7 | All Success Metrics are measurable | [ ] |
| 8 | All Success Metrics have measurement method | [ ] |
| 9 | In Scope section populated | [ ] |
| 10 | Out of Scope section populated (not empty) | [ ] |
| 11 | All Assumptions have Risk if Wrong | [ ] |
| 12 | All Assumptions have Mitigation | [ ] |
| 13 | All Constraints have Rationale | [ ] |
| 14 | No TBDs or placeholders | [ ] |

**Score:** [X] / 14 = [Y]%

---

### PRD Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | ≥1 User Persona defined | [ ] |
| 2 | Every Persona has all required fields | [ ] |
| 3 | Every User Story has ID | [ ] |
| 4 | Every User Story follows As/Want/So format | [ ] |
| 5 | Every User Story has ≥2 Acceptance Criteria | [ ] |
| 6 | All Acceptance Criteria are binary (pass/fail) | [ ] |
| 7 | Every Feature has ID | [ ] |
| 8 | Every Feature traces to User Story | [ ] |
| 9 | Every Feature has Complexity estimate | [ ] |
| 10 | Must Have features defined | [ ] |
| 11 | Won't Have section populated (not empty) | [ ] |
| 12 | Acceptance Criteria Matrix complete | [ ] |
| 13 | All Dependencies have Fallback | [ ] |
| 14 | All Edge Cases have Expected Behavior | [ ] |
| 15 | No TBDs or placeholders | [ ] |

**Score:** [X] / 15 = [Y]%

---

### TAD Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Architecture diagram exists | [ ] |
| 2 | System description provided (2-3 paragraphs) | [ ] |
| 3 | Key Architectural Decisions documented | [ ] |
| 4 | Every tech stack item has version | [ ] |
| 5 | Every tech stack item has justification | [ ] |
| 6 | Every Component has ID | [ ] |
| 7 | Every Component has single responsibility | [ ] |
| 8 | Every Component has interfaces (input/output) | [ ] |
| 9 | Every Component has dependencies listed | [ ] |
| 10 | Data design has ERD or schema diagram | [ ] |
| 11 | All tables/collections defined with all fields | [ ] |
| 12 | Every API endpoint fully specified | [ ] |
| 13 | Every API endpoint has error responses | [ ] |
| 14 | Security model covers authentication | [ ] |
| 15 | Security model covers authorization | [ ] |
| 16 | Security model covers data protection | [ ] |
| 17 | Error handling covers all categories | [ ] |
| 18 | Logging strategy defined | [ ] |
| 19 | No TBDs or placeholders | [ ] |

**Score:** [X] / 19 = [Y]%

---

### Agent Crew Spec Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Agent Roster complete | [ ] |
| 2 | Every Agent has unique ID | [ ] |
| 3 | Every Agent has Identity section complete | [ ] |
| 4 | Every Agent has Responsibilities (not empty) | [ ] |
| 5 | Every Agent has Boundaries (not empty) | [ ] |
| 6 | No overlapping Responsibilities between agents | [ ] |
| 7 | Every Agent has Tools & Access defined | [ ] |
| 8 | Every Agent has Input Protocol | [ ] |
| 9 | Every Agent has Output Protocol | [ ] |
| 10 | Every Agent has Handoff Rules | [ ] |
| 11 | Every Agent has Failure Behavior | [ ] |
| 12 | Every Agent has Quality Standards | [ ] |
| 13 | Coordination Rules defined | [ ] |
| 14 | Conflict Resolution protocol exists | [ ] |
| 15 | Escalation path to human defined | [ ] |
| 16 | No TBDs or placeholders | [ ] |

**Score:** [X] / 16 = [Y]%

---

### MTS Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Header complete (project, version, dates, total) | [ ] |
| 2 | Generation Log exists | [ ] |
| 3 | Every PRD Feature maps to ≥1 task | [ ] |
| 4 | Every TAD Component maps to ≥1 task | [ ] |
| 5 | Every task has ID | [ ] |
| 6 | Every task has action verb + object | [ ] |
| 7 | Every task has Acceptance criterion | [ ] |
| 8 | Every Acceptance criterion is binary | [ ] |
| 9 | Every task has Depends on | [ ] |
| 10 | Dependencies form unbroken chain | [ ] |
| 11 | Every task has Source (PRD/TAD/Infrastructure) | [ ] |
| 12 | Every task has Estimate | [ ] |
| 13 | Tasks are grouped into Phases | [ ] |
| 14 | Final task is "Project complete" | [ ] |
| 15 | Final task acceptance = Ship Checklist 100% | [ ] |
| 16 | Agent can execute each task without inventing steps | [ ] |
| 17 | No ambiguous tasks | [ ] |
| 18 | No TBDs or placeholders | [ ] |

**Score:** [X] / 18 = [Y]%

---

## Cross-Document Validation

| # | Criterion | Pass |
|---|-----------|------|
| 1 | PRD features trace to Project Brief scope | [ ] |
| 2 | PRD In Scope matches Project Brief In Scope | [ ] |
| 3 | TAD components implement PRD features | [ ] |
| 4 | TAD tech stack matches Project Brief constraints | [ ] |
| 5 | Agent responsibilities cover all MTS task types | [ ] |
| 6 | Terminology consistent across all documents | [ ] |
| 7 | Feature IDs consistent (PRD → MTS → Test Plan) | [ ] |
| 8 | Component IDs consistent (TAD → MTS) | [ ] |
| 9 | No contradictions between documents | [ ] |
| 10 | All documents reference same project name | [ ] |

**Score:** [X] / 10 = [Y]%

---

## Gap Report

| # | Document | Section | Issue | Severity | Required Fix |
|---|----------|---------|-------|----------|--------------|
| 1 | [Doc] | [Section] | [Issue description] | Critical / Major / Minor | [What to fix] |
| 2 | | | | | |
| 3 | | | | | |

**Severity Definitions:**
- **Critical:** Blocks execution — must fix before proceed
- **Major:** Creates risk or ambiguity — should fix before proceed
- **Minor:** Polish issue — can fix during build

---

## Final Verdict

| Score Range | Result | Action |
|-------------|--------|--------|
| 100% | ✅ PASS | Proceed to building |
| 95-99% | ⚠️ CONDITIONAL | Fix minor gaps, re-audit |
| <95% | ❌ FAIL | Return to planning |

---

### This Audit Result

**Total Score:** [X]%

**Verdict:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

**Notes:**
[Any additional observations or recommendations]

---

### Re-Audit Log (if applicable)

| Version | Date | Score | Result | Changes Made |
|---------|------|-------|--------|--------------|
| 1.0 | [Date] | [%] | [Result] | Initial audit |
| 1.1 | [Date] | [%] | [Result] | [Fixes applied] |

---

**End of Audit Checklist**

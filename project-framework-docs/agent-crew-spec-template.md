# Agent Crew Specification

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
| A3 | [Agent Name] | [One-line role] | [A1, A2] |

### Workflow Diagram

```
[Visual showing agent coordination]

Example:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Architect  │────▶│  Developer  │────▶│    QA       │
│    (A1)     │     │    (A2)     │     │   (A3)      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Supervisor │
                    │    (A0)     │
                    └─────────────┘
```

---

## Agent Constitutions

---

## Agent A1: [Agent Name]

### Identity

| Attribute | Value |
|-----------|-------|
| **ID** | A1 |
| **Name** | [Agent Name] |
| **Role** | [Single sentence describing function] |
| **Domain** | [Narrow area of expertise] |

### Responsibilities

What this agent owns. Exhaustive list — if not listed, agent doesn't do it.

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]
- [Responsibility 4]
- [Responsibility 5]

### Boundaries

What this agent explicitly DOES NOT do.

- [Exclusion 1]
- [Exclusion 2]
- [Exclusion 3]

### Tools & Access

| Tool/Resource | Access Level | Purpose |
|---------------|--------------|---------|
| [Tool 1] | Read / Write / Execute | [Why needed] |
| [Tool 2] | Read / Write / Execute | [Why needed] |
| [Tool 3] | Read / Write / Execute | [Why needed] |

### Input Protocol

How tasks get assigned to this agent.

```json
{
  "task_id": "string — MTS task reference",
  "task_type": "[allowed type 1 | allowed type 2]",
  "context": {
    "relevant_docs": ["PRD", "TAD sections"],
    "dependencies_complete": "boolean"
  },
  "priority": "low | medium | high | critical",
  "deadline": "ISO timestamp or null"
}
```

### Output Protocol

How this agent reports results.

```json
{
  "task_id": "string — MTS task reference",
  "status": "complete | failed | blocked | handed_off",
  "result": {
    "deliverable": "description or reference",
    "files_created": ["list of paths"],
    "files_modified": ["list of paths"]
  },
  "handoff_to": "agent ID or null",
  "notes": "any relevant context for next step"
}
```

### Handoff Rules

| Condition | Handoff To | Data Passed |
|-----------|------------|-------------|
| [Trigger condition 1] | [Agent ID] | [What gets transferred] |
| [Trigger condition 2] | [Agent ID] | [What gets transferred] |
| [Needs human decision] | Human | [Context for decision] |

### Failure Behavior

When this agent gets stuck:

1. **Attempt self-resolution** — [Specific actions to try]
2. **Log the blocker** — Document issue in Decision Log
3. **Notify supervisor** — Alert [Agent ID or Human]
4. **Pause and await input** — Do not proceed without resolution

### Quality Standards

What "done" means for this agent. All must be true.

- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]
- [ ] [Quality criterion 3]
- [ ] Output follows Output Protocol format
- [ ] No work outside defined Responsibilities

---

## Agent A2: [Agent Name]

### Identity

| Attribute | Value |
|-----------|-------|
| **ID** | A2 |
| **Name** | [Agent Name] |
| **Role** | [Single sentence describing function] |
| **Domain** | [Narrow area of expertise] |

### Responsibilities

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

### Boundaries

- [Exclusion 1]
- [Exclusion 2]

### Tools & Access

| Tool/Resource | Access Level | Purpose |
|---------------|--------------|---------|
| [Tool 1] | Read / Write / Execute | [Why needed] |
| [Tool 2] | Read / Write / Execute | [Why needed] |

### Input Protocol

```json
{
  "task_id": "string",
  "task_type": "[allowed types]",
  "context": {},
  "priority": "low | medium | high | critical"
}
```

### Output Protocol

```json
{
  "task_id": "string",
  "status": "complete | failed | blocked | handed_off",
  "result": {},
  "handoff_to": "agent ID or null"
}
```

### Handoff Rules

| Condition | Handoff To | Data Passed |
|-----------|------------|-------------|
| [Trigger] | [Agent ID] | [Data] |

### Failure Behavior

1. [First action]
2. [Second action]
3. [Escalation path]

### Quality Standards

- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]

---

## Agent A3: [Agent Name]

### Identity

| Attribute | Value |
|-----------|-------|
| **ID** | A3 |
| **Name** | [Agent Name] |
| **Role** | [Single sentence describing function] |
| **Domain** | [Narrow area of expertise] |

### Responsibilities

- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

### Boundaries

- [Exclusion 1]
- [Exclusion 2]

### Tools & Access

| Tool/Resource | Access Level | Purpose |
|---------------|--------------|---------|
| [Tool 1] | Read / Write / Execute | [Why needed] |

### Input Protocol

```json
{
  "task_id": "string",
  "task_type": "[allowed types]",
  "context": {},
  "priority": "low | medium | high | critical"
}
```

### Output Protocol

```json
{
  "task_id": "string",
  "status": "complete | failed | blocked | handed_off",
  "result": {},
  "handoff_to": "agent ID or null"
}
```

### Handoff Rules

| Condition | Handoff To | Data Passed |
|-----------|------------|-------------|
| [Trigger] | [Agent ID] | [Data] |

### Failure Behavior

1. [First action]
2. [Second action]
3. [Escalation path]

### Quality Standards

- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]

---

## Coordination Rules

### Communication Patterns

| Pattern | When Used | Protocol |
|---------|-----------|----------|
| Direct Handoff | Task complete, needs next agent | Use Handoff Rules |
| Broadcast | All agents need to know | [Channel/method] |
| Request | Agent needs input from another | [Format] |

### Conflict Resolution

When agents disagree or overlap:

1. **Check Responsibilities** — Refer to each agent's defined scope
2. **Check Boundaries** — If in one agent's exclusion list, other agent owns it
3. **Consult TAD** — Architecture document is authoritative on technical decisions
4. **Escalate to Human** — If still unclear after steps 1-3

### Escalation Path

```
Agent encounters issue
        │
        ▼
Can self-resolve? ──Yes──▶ Resolve and continue
        │
        No
        │
        ▼
Within another agent's domain? ──Yes──▶ Handoff to that agent
        │
        No
        │
        ▼
Log to Decision Log, notify Human
```

### Supervisor Agent (if applicable)

If the crew has a supervisor agent:

| Attribute | Value |
|-----------|-------|
| **ID** | A0 |
| **Name** | [Supervisor Name] |
| **Role** | Coordinate agents, resolve conflicts, maintain project state |

**Supervisor Responsibilities:**
- Assign tasks from MTS to appropriate agents
- Monitor progress and update Project Pulse
- Resolve inter-agent conflicts
- Escalate to human when needed

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Every agent has a unique ID
- [ ] No two agents have overlapping responsibilities
- [ ] Every agent has explicit boundaries (not empty)
- [ ] Every agent has tools/access defined
- [ ] Input and output protocols are consistent across agents
- [ ] Every agent has handoff rules
- [ ] Every agent has failure behavior defined
- [ ] Coordination rules cover conflict resolution
- [ ] Escalation path to human is clear
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of Agent Crew Specification**

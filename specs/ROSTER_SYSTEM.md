# BUNKER Roster System - Specification v1.0

> Depth charts for Agents, Tools, and Tech Stack
> "Know your roster. Know your fallbacks. No grey areas."

---

## Core Principles

1. **No grey areas** - Every agent/tool has explicit requirements
2. **Always have fallbacks** - Depth at every position
3. **Custom KPIs** - Each agent/tool measured by what matters for IT
4. **Observable** - Everything traceable for debugging at scale
5. **Multi-view** - 4 toggle-able visualization modes

---

## View Modes

| View | Best For | Toggle Key |
|------|----------|------------|
| **Card Grid** | Quick browse, visual overview | `grid` |
| **Table/List** | Sorting, filtering, bulk review | `table` |
| **Depth Chart** | See starters + backups per role | `depth` |
| **Org Chart** | Hierarchy, reporting structure | `org` |

---

## Roster Categories

### 1. Agent Roster (Internal)
AI "staff" that operate within BUNKER

### 2. Tool Roster (Internal)
Infrastructure tools powering BUNKER

### 3. External Roster
Agents/tools built for OTHER apps to consume

---

## Agent Schema

All fields required. No exceptions.

```typescript
interface Agent {
  // Identity
  identity: {
    title: string;           // "Chief Technology & Infrastructure Agent"
    codename: string;        // "CTIA"
    id: string;              // uuid
    status: "active" | "standby" | "offline" | "deprecated";
  };

  // Assignment
  assignment: {
    model_primary: string;   // "claude-opus-4"
    model_fallback: string[]; // ["claude-sonnet-4", "gpt-4o"]
    reports_to: string | null; // agent_id or null if top-level
    direct_reports: string[];  // agent_ids of subordinates
  };

  // Scope - What it CAN and CANNOT do
  scope: {
    responsibilities: string[];  // Explicit list of duties
    permissions: string[];       // What it's allowed to access
    boundaries: string[];        // What it must NOT do
  };

  // Instructions
  instructions: {
    system_prompt: string;       // Core instructions
    decision_rules: DecisionRule[]; // If X then Y logic
    escalation_path: string;     // Who to escalate to
  };

  // KPIs - Custom per agent
  kpis: {
    metrics: Metric[];
    review_frequency: "realtime" | "daily" | "weekly";
  };

  // Meta
  meta: {
    created_at: string;      // ISO timestamp
    created_by: string;
    version: string;
    changelog: string[];
  };
}

interface DecisionRule {
  if: string;
  then: string;
}

interface Metric {
  name: string;
  target: number;
  unit: string;
  current?: number;
}
```

---

## Tool Schema

All fields required. No exceptions.

```typescript
interface Tool {
  // Identity
  identity: {
    name: string;            // "Ollama"
    codename: string;        // "LOCAL-LLM-01"
    id: string;              // uuid
    type: "internal" | "external";
    status: "online" | "degraded" | "offline" | "deprecated";
  };

  // Role
  role: {
    category: string;        // "LLM Runtime", "Automation", "API"
    purpose: string;         // One-liner description
    responsibilities: string[];
    dependencies: string[];  // tool_ids it needs to function
  };

  // Fallback
  fallback: {
    backup_tools: string[];  // tool_ids, ordered by priority
    failover_trigger: string; // Condition that triggers fallback
  };

  // Integration
  integration: {
    connects_to: string[];   // ["BUNKER", "n8n", "CRM"]
    exposed_via: "internal" | "webhook" | "api" | "mcp";
    consumers: string[];     // Who/what uses this tool
  };

  // KPIs - Custom per tool
  kpis: {
    metrics: Metric[];
    health_check: string;    // How to verify it's working
  };

  // Meta
  meta: {
    version: string;
    docs_url: string;
    owner_agent: string;     // Which agent is responsible
    changelog: string[];
  };
}
```

---

## Example: CTIA Agent

```yaml
identity:
  title: Chief Technology & Infrastructure Agent
  codename: CTIA
  id: agent-001
  status: active

assignment:
  model_primary: claude-opus-4
  model_fallback:
    - claude-sonnet-4
    - gpt-4o
  reports_to: null
  direct_reports: []

scope:
  responsibilities:
    - Architecture decisions for BUNKER
    - Infrastructure design (local + cloud hybrid)
    - Integration strategy (n8n, APIs)
    - Code implementation and review
    - Cost optimization strategy
    - Security and reliability guidance
  permissions:
    - Read/write all BUNKER code
    - Access all tool configurations
    - Create/modify agent definitions
  boundaries:
    - Cannot execute financial transactions
    - Cannot access production secrets directly
    - Must escalate security incidents to human

instructions:
  system_prompt: |
    You are the Chief Technology & Infrastructure Agent for BUNKER.
    Prioritize: reliability > cost > speed.
    Always document decisions. Always have fallbacks.
  decision_rules:
    - if: "task_complexity > 8"
      then: "use claude-opus"
    - if: "task_complexity <= 5"
      then: "prefer local models first"
  escalation_path: human-owner

kpis:
  metrics:
    - name: architecture_decisions_documented
      target: 100
      unit: "%"
    - name: build_success_rate
      target: 95
      unit: "%"
    - name: response_quality
      target: 4.5
      unit: "/ 5 rating"
  review_frequency: weekly

meta:
  created_at: "2026-01-01"
  created_by: owner
  version: "1.0.0"
  changelog:
    - "1.0.0 - Initial creation"
```

---

## Example: Ollama Tool

```yaml
identity:
  name: Ollama
  codename: LOCAL-LLM-01
  id: tool-001
  type: internal
  status: online

role:
  category: LLM Runtime
  purpose: Hosts and serves local LLM models
  responsibilities:
    - Load/unload models on demand
    - Serve inference requests
    - Manage model memory allocation
  dependencies: []

fallback:
  backup_tools:
    - tool-002  # LM Studio
    - tool-003  # Cloud API fallback
  failover_trigger: "health_check fails 3 consecutive times"

integration:
  connects_to:
    - BUNKER
    - n8n
  exposed_via: internal
  consumers:
    - CTIA
    - Lead Scorer Agent

kpis:
  metrics:
    - name: uptime
      target: 99.5
      unit: "%"
    - name: avg_response_time
      target: 2000
      unit: "ms"
    - name: requests_per_day
      target: 500
      unit: "requests"
  health_check: "GET http://localhost:11434/api/tags returns 200"

meta:
  version: "0.5.x"
  docs_url: "https://ollama.ai/docs"
  owner_agent: agent-001
  changelog:
    - "Added to BUNKER stack"
```

---

## Hierarchy Structure

```
                    ┌─────────────┐
                    │   OWNER     │
                    │  (Human)    │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │    CTIA     │
                    │ Claude Opus │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐
   │ Code Agent  │  │ DevOps Agent│  │ Research    │
   │             │  │             │  │ Agent       │
   └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Depth Chart Format

**Position: [Role Name]**

| Depth | Agent/Model | Trigger Condition |
|-------|-------------|-------------------|
| Starter | Primary | Default |
| 2nd | Backup 1 | Condition A |
| 3rd | Backup 2 | Condition B |

---

## Implementation Status

- [ ] Agent schema TypeScript types
- [ ] Tool schema TypeScript types
- [ ] Roster data store (JSON/DB)
- [ ] Card Grid view component
- [ ] Table/List view component
- [ ] Depth Chart view component
- [ ] Org Chart view component
- [ ] View toggle UI
- [ ] Agent CRUD operations
- [ ] Tool CRUD operations
- [ ] KPI dashboard per agent/tool

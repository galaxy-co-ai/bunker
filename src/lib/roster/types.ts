// ═══════════════════════════════════════════════════════════════
// BUNKER Roster System - Type Definitions
// No grey areas. Every field required.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// AGENT TYPES
// ─────────────────────────────────────────────────────────────────

export type AgentStatus = 'active' | 'standby' | 'offline' | 'deprecated';

export interface DecisionRule {
  if: string;
  then: string;
}

export interface Metric {
  name: string;
  target: number;
  unit: string;
  current?: number;
}

export interface Agent {
  // Identity
  identity: {
    title: string;
    codename: string;
    id: string;
    status: AgentStatus;
    avatar?: string; // Icon or image for card view
  };

  // Assignment
  assignment: {
    model_primary: string;
    model_fallback: string[];
    reports_to: string | null; // agent_id or null if top-level
    direct_reports: string[];
  };

  // Scope - What it CAN and CANNOT do
  scope: {
    responsibilities: string[];
    permissions: string[];
    boundaries: string[];
  };

  // Instructions
  instructions: {
    system_prompt: string;
    decision_rules: DecisionRule[];
    escalation_path: string;
  };

  // KPIs - Custom per agent
  kpis: {
    metrics: Metric[];
    review_frequency: 'realtime' | 'daily' | 'weekly';
  };

  // Meta
  meta: {
    created_at: string;
    created_by: string;
    version: string;
    changelog: string[];
  };
}

// ─────────────────────────────────────────────────────────────────
// TOOL TYPES
// ─────────────────────────────────────────────────────────────────

export type ToolStatus = 'online' | 'degraded' | 'offline' | 'deprecated';
export type ToolType = 'internal' | 'external';
export type ExposureType = 'internal' | 'webhook' | 'api' | 'mcp';
export type ToolCategory =
  | 'llm-runtime'
  | 'llm-model'
  | 'cloud-api'
  | 'automation'
  | 'data-enrichment'
  | 'database'
  | 'monitoring';

export interface Tool {
  // Identity
  identity: {
    name: string;
    codename: string;
    id: string;
    type: ToolType;
    status: ToolStatus;
    icon?: string;
  };

  // Role
  role: {
    category: ToolCategory;
    purpose: string;
    responsibilities: string[];
    dependencies: string[]; // tool_ids
  };

  // Fallback
  fallback: {
    backup_tools: string[]; // tool_ids, ordered by priority
    failover_trigger: string;
  };

  // Integration
  integration: {
    connects_to: string[];
    exposed_via: ExposureType;
    consumers: string[];
  };

  // Configuration (for toggleable tools)
  config: {
    enabled: boolean;
    api_key_required: boolean;
    api_key_set: boolean;
    endpoint?: string;
    settings?: Record<string, unknown>;
  };

  // KPIs - Custom per tool
  kpis: {
    metrics: Metric[];
    health_check: string;
  };

  // Meta
  meta: {
    version: string;
    docs_url: string;
    owner_agent: string;
    changelog: string[];
  };
}

// ─────────────────────────────────────────────────────────────────
// ROSTER TYPES
// ─────────────────────────────────────────────────────────────────

export interface Roster {
  agents: Agent[];
  tools: Tool[];
  lastUpdated: string;
  version: string;
}

// ─────────────────────────────────────────────────────────────────
// VIEW TYPES
// ─────────────────────────────────────────────────────────────────

export type RosterView = 'grid' | 'table' | 'depth' | 'org';

export interface DepthChartPosition {
  role: string;
  depth: {
    level: number;
    agent_or_tool_id: string;
    trigger_condition: string;
  }[];
}

export interface OrgChartNode {
  id: string;
  type: 'human' | 'agent';
  name: string;
  children: OrgChartNode[];
}

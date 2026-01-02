// ═══════════════════════════════════════════════════════════════
// Org Chart View - Hierarchy and reporting structure
// ═══════════════════════════════════════════════════════════════

import { agents, getDirectReports } from '../../lib/roster/agents';
import type { Agent } from '../../lib/roster/types';

export function OrgChartView() {
  // Get top-level agent (reports to no one)
  const topLevelAgents = agents.filter((a) => a.assignment.reports_to === null);

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-text-muted mb-6">
        Organizational hierarchy showing reporting structure.
      </div>

      {/* Owner (Human) */}
      <div className="mb-4">
        <OrgNode
          title="OWNER"
          subtitle="Human Operator"
          type="human"
          status="active"
        />
      </div>

      {/* Connector Line */}
      <div className="w-px h-8 bg-vault-yellow/50" />

      {/* Top Level Agents */}
      <div className="flex flex-wrap justify-center gap-8">
        {topLevelAgents.map((agent) => (
          <AgentBranch key={agent.identity.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

interface AgentBranchProps {
  agent: Agent;
  level?: number;
}

function AgentBranch({ agent, level = 0 }: AgentBranchProps) {
  const directReports = getDirectReports(agent.identity.id);

  return (
    <div className="flex flex-col items-center">
      <OrgNode
        title={agent.identity.codename}
        subtitle={agent.identity.title}
        model={agent.assignment.model_primary}
        type="agent"
        status={agent.identity.status}
      />

      {directReports.length > 0 && (
        <>
          {/* Connector Line */}
          <div className="w-px h-6 bg-pip-green/50" />

          {/* Horizontal connector */}
          {directReports.length > 1 && (
            <div
              className="h-px bg-pip-green/50"
              style={{ width: `${directReports.length * 180}px` }}
            />
          )}

          {/* Child Agents */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {directReports.map((child) => (
              <div key={child.identity.id} className="flex flex-col items-center">
                {directReports.length > 1 && (
                  <div className="w-px h-4 bg-pip-green/50" />
                )}
                <AgentBranch agent={child} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface OrgNodeProps {
  title: string;
  subtitle: string;
  model?: string;
  type: 'human' | 'agent';
  status: string;
}

function OrgNode({ title, subtitle, model, type, status }: OrgNodeProps) {
  const isHuman = type === 'human';

  return (
    <div
      className={`
        min-w-[160px] max-w-[200px] p-3 rounded border text-center
        ${isHuman
          ? 'bg-vault-yellow/20 border-vault-yellow'
          : status === 'active'
          ? 'bg-pip-green/10 border-pip-green/50'
          : 'bg-concrete-medium border-vault-brown/30'}
      `}
    >
      {/* Icon */}
      <div className={`text-2xl mb-1 ${isHuman ? 'text-vault-yellow' : 'text-pip-green'}`}>
        {isHuman ? '\u263A' : '\u2699'}
      </div>

      {/* Title */}
      <div className={`text-sm font-bold ${isHuman ? 'text-vault-yellow' : 'text-pip-green'}`}>
        {title}
      </div>

      {/* Subtitle */}
      <div className="text-[10px] text-text-muted truncate" title={subtitle}>
        {subtitle}
      </div>

      {/* Model (for agents) */}
      {model && (
        <div className="mt-2 px-2 py-0.5 bg-concrete-dark rounded text-[10px] text-text-secondary">
          {model}
        </div>
      )}

      {/* Status Badge */}
      {!isHuman && (
        <div className="mt-2">
          <span className={`px-2 py-0.5 rounded text-[9px] ${
            status === 'active' ? 'bg-safe/20 text-safe' :
            status === 'standby' ? 'bg-caution/20 text-caution' :
            'bg-text-muted/20 text-text-muted'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

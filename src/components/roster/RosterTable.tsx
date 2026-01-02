// ═══════════════════════════════════════════════════════════════
// Roster Table - Table/List view for agents and tools
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { agents } from '../../lib/roster/agents';
import { tools } from '../../lib/roster/tools';

interface RosterTableProps {
  type: 'agents' | 'tools';
}

export function RosterTable({ type }: RosterTableProps) {
  const [sortField, setSortField] = useState<string>('codename');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="text-left p-2 text-text-muted text-[10px] cursor-pointer hover:text-vault-yellow transition-colors"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-vault-yellow">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
        )}
      </div>
    </th>
  );

  if (type === 'agents') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b border-vault-brown/30">
            <tr>
              <SortHeader field="codename">CODENAME</SortHeader>
              <SortHeader field="title">TITLE</SortHeader>
              <SortHeader field="status">STATUS</SortHeader>
              <SortHeader field="model">PRIMARY MODEL</SortHeader>
              <SortHeader field="fallbacks">FALLBACKS</SortHeader>
              <SortHeader field="reports_to">REPORTS TO</SortHeader>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.identity.id}
                className="border-b border-vault-brown/10 hover:bg-concrete-medium/50 transition-colors cursor-pointer"
              >
                <td className="p-2">
                  <span className="text-vault-yellow font-bold">{agent.identity.codename}</span>
                </td>
                <td className="p-2 text-text-secondary max-w-[200px] truncate">
                  {agent.identity.title}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    agent.identity.status === 'active' ? 'bg-safe/20 text-safe' :
                    agent.identity.status === 'standby' ? 'bg-caution/20 text-caution' :
                    'bg-text-muted/20 text-text-muted'
                  }`}>
                    {agent.identity.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 text-pip-green">{agent.assignment.model_primary}</td>
                <td className="p-2 text-text-muted">
                  {agent.assignment.model_fallback.length > 0
                    ? agent.assignment.model_fallback.join(', ')
                    : '—'}
                </td>
                <td className="p-2 text-text-muted">
                  {agent.assignment.reports_to || 'OWNER'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Tools table
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="border-b border-vault-brown/30">
          <tr>
            <SortHeader field="name">NAME</SortHeader>
            <SortHeader field="category">CATEGORY</SortHeader>
            <SortHeader field="status">STATUS</SortHeader>
            <SortHeader field="enabled">ENABLED</SortHeader>
            <SortHeader field="api_key">API KEY</SortHeader>
            <SortHeader field="fallbacks">FALLBACKS</SortHeader>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr
              key={tool.identity.id}
              className={`border-b border-vault-brown/10 hover:bg-concrete-medium/50 transition-colors cursor-pointer ${
                !tool.config.enabled ? 'opacity-60' : ''
              }`}
            >
              <td className="p-2">
                <span className="text-pip-green font-bold">{tool.identity.name}</span>
                <div className="text-[10px] text-text-muted">{tool.identity.codename}</div>
              </td>
              <td className="p-2">
                <span className={`text-[10px] ${
                  tool.role.category === 'cloud-api' ? 'text-blue-400' :
                  tool.role.category === 'llm-model' ? 'text-vault-yellow' :
                  tool.role.category === 'llm-runtime' ? 'text-pip-green' :
                  tool.role.category === 'automation' ? 'text-purple-400' :
                  'text-text-muted'
                }`}>
                  {tool.role.category.toUpperCase().replace('-', ' ')}
                </span>
              </td>
              <td className="p-2">
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  tool.identity.status === 'online' ? 'bg-safe/20 text-safe' :
                  tool.identity.status === 'degraded' ? 'bg-caution/20 text-caution' :
                  'bg-text-muted/20 text-text-muted'
                }`}>
                  {tool.identity.status.toUpperCase()}
                </span>
              </td>
              <td className="p-2">
                <span className={tool.config.enabled ? 'text-safe' : 'text-text-muted'}>
                  {tool.config.enabled ? 'ON' : 'OFF'}
                </span>
              </td>
              <td className="p-2">
                {tool.config.api_key_required ? (
                  <span className={tool.config.api_key_set ? 'text-safe' : 'text-caution'}>
                    {tool.config.api_key_set ? '\u2713 SET' : '\u26A0 NEEDED'}
                  </span>
                ) : (
                  <span className="text-text-muted">N/A</span>
                )}
              </td>
              <td className="p-2 text-text-muted">
                {tool.fallback.backup_tools.length > 0
                  ? `${tool.fallback.backup_tools.length} configured`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

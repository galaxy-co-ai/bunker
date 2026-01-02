// ═══════════════════════════════════════════════════════════════
// Depth Chart View - Show starters and backups per role
// ═══════════════════════════════════════════════════════════════

import { getDepthChart } from '../../lib/roster';

const roles = ['reasoning', 'fast-tasks', 'research'];

export function DepthChartView() {
  return (
    <div className="space-y-4">
      <div className="text-xs text-text-muted mb-4">
        Depth charts show primary assignments and fallback order for each role.
      </div>

      {roles.map((role) => {
        const chart = getDepthChart(role);
        if (!chart) return null;

        return (
          <div
            key={role}
            className="bg-concrete-dark border border-vault-brown/30 rounded p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-vault-yellow">\u25B6</span>
              <h3 className="text-vault-yellow text-sm font-bold">
                {chart.role.toUpperCase()}
              </h3>
            </div>

            <div className="space-y-2">
              {chart.depth.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded border ${
                    index === 0
                      ? 'bg-pip-green/10 border-pip-green/30'
                      : 'bg-concrete-medium border-vault-brown/20'
                  }`}
                >
                  {/* Depth Level */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-pip-green text-concrete-dark'
                      : 'bg-vault-brown/30 text-text-muted'
                  }`}>
                    {index === 0 ? '\u2605' : index + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${
                      index === 0 ? 'text-pip-green' : 'text-text-secondary'
                    }`}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-text-muted">{item.id}</div>
                  </div>

                  {/* Trigger Condition */}
                  <div className="text-right">
                    <div className="text-[10px] text-text-muted">TRIGGER</div>
                    <div className="text-xs text-text-secondary">{item.trigger}</div>
                  </div>

                  {/* Level Badge */}
                  <div className={`px-2 py-1 rounded text-[10px] ${
                    index === 0
                      ? 'bg-pip-green/20 text-pip-green'
                      : index === 1
                      ? 'bg-caution/20 text-caution'
                      : 'bg-text-muted/20 text-text-muted'
                  }`}>
                    {index === 0 ? 'STARTER' : index === 1 ? '2ND' : `${index + 1}TH`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-text-muted mt-4 p-2 bg-concrete-medium rounded">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pip-green" />
          <span>Starter (Primary)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-caution" />
          <span>2nd String</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-text-muted" />
          <span>Backup</span>
        </div>
      </div>
    </div>
  );
}

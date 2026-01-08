// ═══════════════════════════════════════════════════════════════
// BUNKER - Navigation Bar Component
// Main navigation tabs and quick actions
// ═══════════════════════════════════════════════════════════════

// No React import needed for modern JSX transform

export type AppView = 'dashboard' | 'roster' | 'vault' | 'console' | 'n8n';

interface NavTab {
  key: AppView;
  label: string;
  icon: string;
}

const NAV_TABS: NavTab[] = [
  { key: 'dashboard', label: 'DASHBOARD', icon: '\u2302' },
  { key: 'roster', label: 'ROSTER', icon: '\u2630' },
  { key: 'vault', label: 'VAULT', icon: '\uD83D\uDD10' },
  { key: 'console', label: 'CONSOLE', icon: '>_' },
  { key: 'n8n', label: 'N8N', icon: '⚡' },
];

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger';
}

interface NavigationBarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenConfig: () => void;
}

export function NavigationBar({ activeView, onViewChange, onOpenConfig }: NavigationBarProps) {
  const quickActions: QuickAction[] = [
    { icon: '🧪', label: 'TEST', onClick: () => console.log('Test model') },
    { icon: '📊', label: 'ANALYTICS', onClick: () => console.log('Analytics') },
    { icon: '⚙️', label: 'CONFIG', onClick: onOpenConfig },
    { icon: '🔄', label: 'REFRESH', onClick: () => window.location.reload(), variant: 'success' },
    { icon: '🚨', label: 'ERRORS', onClick: () => console.log('Errors'), variant: 'danger' },
  ];

  return (
    <div className="flex-shrink-0 bg-concrete-medium border-b border-vault-brown/30">
      <div className="flex items-center justify-between px-4">
        {/* Navigation Tabs */}
        <nav className="flex gap-1">
          {NAV_TABS.map((tab) => (
            <NavTabButton
              key={tab.key}
              tab={tab}
              isActive={activeView === tab.key}
              onClick={() => onViewChange(tab.key)}
            />
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {quickActions.map((action) => (
            <QuickActionButton
              key={action.label}
              action={action}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface NavTabButtonProps {
  tab: NavTab;
  isActive: boolean;
  onClick: () => void;
}

function NavTabButton({ tab, isActive, onClick }: NavTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-xs border-b-2 transition-colors flex items-center gap-2
        ${isActive
          ? 'border-vault-yellow text-vault-yellow bg-vault-yellow/10'
          : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-concrete-dark/50'}
      `}
    >
      <span>{tab.icon}</span>
      {tab.label}
    </button>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
}

function QuickActionButton({ action }: QuickActionButtonProps) {
  const variantClasses = {
    default: 'border-vault-yellow/30 text-text-muted hover:text-vault-yellow hover:bg-vault-yellow/10',
    success: 'border-safe/50 text-safe hover:bg-safe/20',
    danger: 'border-danger/50 text-danger hover:bg-danger/20',
  };

  return (
    <button
      onClick={action.onClick}
      className={`
        px-2 py-1 text-xs flex items-center gap-1.5 rounded border transition-colors
        ${variantClasses[action.variant ?? 'default']}
      `}
    >
      <span>{action.icon}</span>
      <span className="hidden xl:inline">{action.label}</span>
    </button>
  );
}

export default NavigationBar;

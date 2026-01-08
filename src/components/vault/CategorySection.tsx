// ═══════════════════════════════════════════════════════════════
// BUNKER - Category Section Component
// Groups secrets by category with header
// ═══════════════════════════════════════════════════════════════

import { ParsedSecret, categoryConfig } from './types';
import { SecretRow } from './SecretRow';

interface CategorySectionProps {
  category: string;
  secrets: ParsedSecret[];
  revealedSecrets: Set<string>;
  secretValues: Record<string, string>;
  onReveal: (name: string) => void;
  onCopy: (name: string) => void;
  onEdit: (name: string) => void;
  onDelete: (name: string) => void;
}

export function CategorySection({
  category,
  secrets,
  revealedSecrets,
  secretValues,
  onReveal,
  onCopy,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  const config = categoryConfig[category] || categoryConfig['Other'];

  return (
    <div className="vault-panel-dark">
      {/* Category Header */}
      <div className="px-3 py-2 border-b border-border-warning/30 flex items-center gap-2">
        <span aria-hidden="true">{config.icon}</span>
        <span className={`heading-text text-xs ${config.color}`}>{category}</span>
        <span className="text-text-muted text-[10px] ml-auto">{secrets.length} ITEMS</span>
      </div>

      {/* Secrets List */}
      <div className="divide-y divide-border-warning/20">
        {secrets.map((secret, index) => (
          <SecretRow
            key={secret.name}
            secret={secret}
            isRevealed={revealedSecrets.has(secret.name)}
            value={secretValues[secret.name]}
            index={index}
            onReveal={() => onReveal(secret.name)}
            onCopy={() => onCopy(secret.name)}
            onEdit={() => onEdit(secret.name)}
            onDelete={() => onDelete(secret.name)}
          />
        ))}
      </div>
    </div>
  );
}

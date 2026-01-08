// ═══════════════════════════════════════════════════════════════
// BUNKER - Cloud Provider Card Component (Compact)
// Status card for individual cloud API providers
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import {
  CloudProviderCardProps,
  PROVIDER_INFO,
  CloudProvider,
  CloudRouterStatus,
} from '../../lib/cloud-router/types';

// ═══════════════════════════════════════════════════════════════
// COMPACT PROVIDER CARD
// ═══════════════════════════════════════════════════════════════

export function CloudProviderCard({
  provider,
  status,
  onConfigure,
}: CloudProviderCardProps) {
  const info = PROVIDER_INFO[provider];
  const isConfigured = status.api_key_configured;
  const isHealthy = status.is_healthy;

  return (
    <div
      className={`
        vault-panel-dark p-2 transition-all duration-200
        ${isConfigured && isHealthy ? 'border-safe/30' : ''}
        hover:border-vault-yellow/50
      `}
    >
      {/* Single Row: Icon, Name, Status, Action */}
      <div className="flex items-center gap-2">
        {/* LED */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            !isConfigured ? 'bg-danger' : isHealthy ? 'bg-safe led-glow-safe' : 'bg-caution'
          }`}
        />

        {/* Icon & Name */}
        <span className="text-base">{info.icon}</span>
        <span className="heading-text text-[11px] flex-1">{info.name.toUpperCase()}</span>

        {/* Status Badge */}
        <span
          className={`px-1.5 py-0.5 text-[9px] font-terminal rounded ${
            isConfigured
              ? 'text-safe bg-safe/10 border border-safe/30'
              : 'text-danger bg-danger/10 border border-danger/30'
          }`}
        >
          {isConfigured ? 'READY' : 'NOT SET'}
        </span>

        {/* Action Button */}
        <button
          onClick={onConfigure}
          className="px-2 py-1 text-[9px] font-terminal text-vault-yellow
            border border-vault-yellow/30 hover:bg-vault-yellow/10 transition-colors"
        >
          {isConfigured ? 'EDIT' : 'SET'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER CARDS LIST
// ═══════════════════════════════════════════════════════════════

interface CloudProvidersListProps {
  status: CloudRouterStatus | null;
  onConfigure?: (provider: CloudProvider) => void;
  onTest?: (provider: CloudProvider) => void;
}

export function CloudProvidersList({
  status,
  onConfigure,
  onTest,
}: CloudProvidersListProps) {
  const providers: CloudProvider[] = ['claude', 'chatgpt', 'perplexity'];

  if (!status) {
    return (
      <div className="space-y-1">
        {providers.map((provider) => (
          <div key={provider} className="vault-panel-dark p-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-text-muted/20" />
              <div className="w-16 h-3 bg-text-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {providers.map((provider, index) => {
        const providerStatus = status.providers.find((p) => p.provider === provider);
        if (!providerStatus) return null;

        return (
          <motion.div
            key={provider}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <CloudProviderCard
              provider={provider}
              status={providerStatus}
              onConfigure={() => onConfigure?.(provider)}
              onTest={() => onTest?.(provider)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

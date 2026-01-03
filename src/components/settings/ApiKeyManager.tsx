// BUNKER API Key Manager
// List of configurable API keys

import { useSettingsStore } from '../../lib/store';
import { ApiKeyInput } from './ApiKeyInput';

export function ApiKeyManager() {
  const { apiKeyStatuses, isLoading, refreshApiKeyStatuses } = useSettingsStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-text-muted">
          <span className="animate-spin">◌</span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apiKeyStatuses.map((keyStatus) => (
        <ApiKeyInput
          key={keyStatus.name}
          keyName={keyStatus.name}
          displayName={keyStatus.displayName}
          isSet={keyStatus.isSet}
          isConnected={keyStatus.isConnected}
          onStatusChange={refreshApiKeyStatuses}
        />
      ))}
    </div>
  );
}

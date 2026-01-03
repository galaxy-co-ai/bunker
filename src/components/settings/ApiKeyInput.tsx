// BUNKER API Key Input
// Individual key input (never shows actual value)

import { useState } from 'react';
import { useSettingsStore } from '../../lib/store';

interface ApiKeyInputProps {
  keyName: string;
  displayName: string;
  isSet: boolean;
  isConnected: boolean;
  onStatusChange: () => void;
}

export function ApiKeyInput({
  keyName,
  displayName,
  isSet,
  isConnected,
  onStatusChange,
}: ApiKeyInputProps) {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { setApiKey, removeApiKey } = useSettingsStore();

  const handleSave = async () => {
    if (!value.trim()) return;

    setIsSaving(true);
    const success = await setApiKey(keyName, value);
    setIsSaving(false);

    if (success) {
      setValue('');
      setIsEditing(false);
      onStatusChange();
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    const success = await removeApiKey(keyName);
    setIsSaving(false);

    if (success) {
      onStatusChange();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue('');
  };

  return (
    <div className="border border-vault-brown/30 rounded p-3 bg-concrete-medium">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-safe'
                : isSet
                ? 'bg-caution'
                : 'bg-text-muted'
            }`}
          />
          <span className="text-vault-yellow text-sm font-terminal">
            {displayName}
          </span>
        </div>
        <span
          className={`text-xs ${
            isConnected
              ? 'text-safe'
              : isSet
              ? 'text-caution'
              : 'text-text-muted'
          }`}
        >
          {isConnected ? 'CONNECTED' : isSet ? 'CONFIGURED' : 'NOT SET'}
        </span>
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter API key..."
            autoFocus
            className="flex-1 bg-concrete-dark border border-vault-brown/30 rounded px-2 py-1 text-sm text-text-secondary font-terminal focus:border-vault-yellow focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !value.trim()}
            className="px-3 py-1 text-xs bg-safe/20 border border-safe text-safe hover:bg-safe/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '...' : 'SAVE'}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-text-secondary transition-colors"
          >
            CANCEL
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-vault-yellow hover:border-vault-yellow transition-colors"
          >
            {isSet ? 'UPDATE' : 'ADD KEY'}
          </button>
          {isSet && (
            <button
              onClick={handleRemove}
              disabled={isSaving}
              className="px-3 py-1 text-xs border border-danger/50 text-danger hover:bg-danger/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              REMOVE
            </button>
          )}
        </div>
      )}
    </div>
  );
}

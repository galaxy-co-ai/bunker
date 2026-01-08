// ═══════════════════════════════════════════════════════════════
// BUNKER - Centralized Configuration Modal
// All integrations configured in one place
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type ConfigTab = 'ai-apis' | 'ai-logins' | 'integrations' | 'local';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialTab?: ConfigTab;
  highlightKey?: string;
}

interface ApiKeyConfig {
  name: string;
  label: string;
  icon: string;
  keyName: string;
  docsUrl: string;
  placeholder: string;
}

interface LoginConfig {
  name: string;
  label: string;
  icon: string;
  url: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG DATA
// ═══════════════════════════════════════════════════════════════

const API_CONFIGS: ApiKeyConfig[] = [
  {
    name: 'claude',
    label: 'Claude (Anthropic)',
    icon: '🧠',
    keyName: 'ANTHROPIC_API_KEY',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
  },
  {
    name: 'chatgpt',
    label: 'ChatGPT (OpenAI)',
    icon: '💬',
    keyName: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
  {
    name: 'perplexity',
    label: 'Perplexity',
    icon: '🔍',
    keyName: 'PERPLEXITY_API_KEY',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    placeholder: 'pplx-...',
  },
];

const LOGIN_CONFIGS: LoginConfig[] = [
  {
    name: 'claude',
    label: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai',
    description: 'Use your Claude Pro subscription for FREE',
  },
  {
    name: 'chatgpt',
    label: 'ChatGPT',
    icon: '💬',
    url: 'https://chat.openai.com',
    description: 'Use your ChatGPT Plus subscription for FREE',
  },
  {
    name: 'perplexity',
    label: 'Perplexity',
    icon: '🔍',
    url: 'https://perplexity.ai',
    description: 'Use your Perplexity Pro subscription for FREE',
  },
];

const INTEGRATION_CONFIGS: ApiKeyConfig[] = [
  {
    name: 'github',
    label: 'GitHub',
    icon: '📦',
    keyName: 'GITHUB_TOKEN',
    docsUrl: 'https://github.com/settings/tokens',
    placeholder: 'ghp_...',
  },
  {
    name: 'vercel',
    label: 'Vercel',
    icon: '▲',
    keyName: 'VERCEL_TOKEN',
    docsUrl: 'https://vercel.com/account/tokens',
    placeholder: '',
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ConfigModal({ isOpen, onClose, onSaved, initialTab = 'ai-apis', highlightKey }: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);

  if (!isOpen) return null;

  const tabs: { key: ConfigTab; label: string; icon: string }[] = [
    { key: 'ai-apis', label: 'AI APIs', icon: '🔑' },
    { key: 'ai-logins', label: 'AI Logins', icon: '🌐' },
    { key: 'local', label: 'Local Infra', icon: '💻' },
    { key: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="vault-panel w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
          <h2 className="heading-text text-lg flex items-center gap-3">
            <span className="text-vault-yellow">⚙️</span>
            CONFIGURATION
          </h2>
          <button
            onClick={onClose}
            aria-label="Close configuration modal"
            className="text-text-muted hover:text-vault-yellow transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex border-b border-border-warning/30 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 px-4 py-3 text-sm font-terminal flex items-center justify-center gap-2
                transition-all border-b-2
                ${activeTab === tab.key
                  ? 'border-vault-yellow text-vault-yellow bg-vault-yellow/10'
                  : 'border-transparent text-text-muted hover:text-vault-yellow hover:bg-vault-yellow/5'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={activeTab}>
          <AnimatePresence mode="wait">
            {activeTab === 'ai-apis' && (
              <ApiKeysTab key="ai-apis" configs={API_CONFIGS} onSaved={onSaved} highlightKey={highlightKey} />
            )}
            {activeTab === 'ai-logins' && (
              <LoginsTab key="ai-logins" configs={LOGIN_CONFIGS} />
            )}
            {activeTab === 'local' && (
              <LocalConfigTab onSaved={onSaved} />
            )}
            {activeTab === 'integrations' && (
              <ApiKeysTab key="integrations" configs={INTEGRATION_CONFIGS} onSaved={onSaved} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-warning/30 bg-concrete-dark/50 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span className="flex items-center gap-2">
              <span className="text-safe">🔒</span>
              All credentials stored locally with AES-256 encryption
            </span>
            <button
              onClick={onClose}
              className="vault-button vault-button-small"
            >
              DONE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// API KEYS TAB
// ═══════════════════════════════════════════════════════════════

function ApiKeysTab({ configs, onSaved, highlightKey }: { configs: ApiKeyConfig[]; onSaved?: () => void; highlightKey?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {configs.map((config) => (
        <ApiKeyRow key={config.name} config={config} onSaved={onSaved} isHighlighted={config.keyName === highlightKey} />
      ))}
    </motion.div>
  );
}

function ApiKeyRow({ config, onSaved, isHighlighted }: { config: ApiKeyConfig; onSaved?: () => void; isHighlighted?: boolean }) {
  const [value, setValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if key exists
  useEffect(() => {
    checkKeyExists();
  }, []);

  const checkKeyExists = async () => {
    try {
      const result = await invoke<{ success: boolean; data: Array<{ value: string | null }> | null }>('vault_get', {
        name: config.keyName,
      });
      setIsConfigured(result.success && result.data?.[0]?.value != null);
    } catch {
      setIsConfigured(false);
    }
  };

  const handleSave = async () => {
    if (!value.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await invoke<{ success: boolean; message: string }>('vault_add', {
        name: config.keyName,
        value: value.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Saved!' });
        setValue('');
        setIsConfigured(true);
        onSaved?.();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Error: ${e}` });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className={`vault-panel-dark p-4 transition-colors duration-1000 ${isHighlighted ? 'bg-vault-yellow/10 border-vault-yellow' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Icon & Label */}
        <div className="flex-shrink-0">
          <span className="text-2xl">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="heading-text text-sm">{config.label}</span>
            {isConfigured ? (
              <span className="px-2 py-0.5 text-[10px] bg-safe/20 text-safe border border-safe/30 rounded">
                CONFIGURED
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] bg-danger/20 text-danger border border-danger/30 rounded">
                NOT SET
              </span>
            )}
          </div>

          {/* Input Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <label htmlFor={`api-key-${config.name}`} className="sr-only">
                {config.label} API Key
              </label>
              <input
                id={`api-key-${config.name}`}
                type={showValue ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={isConfigured ? '••••••••••••' : config.placeholder}
                aria-describedby={`api-key-${config.name}-link`}
                className="w-full bg-concrete-dark border border-border-warning/50 px-3 py-2 pr-10
                  text-terminal-green font-mono text-sm
                  focus:border-vault-yellow focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                aria-label={showValue ? 'Hide API key' : 'Show API key'}
                aria-pressed={showValue}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-vault-yellow text-sm"
              >
                {showValue ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={!value.trim() || saving}
              aria-label={`${isConfigured ? 'Update' : 'Save'} ${config.label} API key`}
              className="vault-button vault-button-small px-4 disabled:opacity-50"
            >
              {saving ? '...' : isConfigured ? 'UPDATE' : 'SAVE'}
            </button>
          </div>

          {/* Help Link & Message */}
          <div className="flex items-center justify-between mt-2">
            <a
              id={`api-key-${config.name}-link`}
              href={config.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-vault-yellow hover:underline"
            >
              Get API key →
            </a>
            {message && (
              <span className={`text-[10px] ${message.type === 'success' ? 'text-safe' : 'text-danger'}`}>
                {message.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGINS TAB (Browser Mode)
// ═══════════════════════════════════════════════════════════════

function LoginsTab({ configs }: { configs: LoginConfig[] }) {
  const [launching, setLaunching] = useState<string | null>(null);

  const handleLaunch = async (config: LoginConfig) => {
    setLaunching(config.name);

    try {
      // Dynamic import to avoid issues
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const { appDataDir } = await import('@tauri-apps/api/path');

      const dataDir = await appDataDir();

      const webview = new WebviewWindow(`login-${config.name}`, {
        url: config.url,
        title: `BUNKER - Login to ${config.label}`,
        width: 1200,
        height: 800,
        center: true,
        resizable: true,
        decorations: true,
        dataDirectory: `${dataDir}/browser-sessions/${config.name}`,
      });

      webview.once('tauri://created', () => {
        setLaunching(null);
      });

      webview.once('tauri://error', () => {
        setLaunching(null);
      });
    } catch (e) {
      console.error('Failed to launch browser:', e);
      setLaunching(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="text-sm text-text-muted mb-4">
        Login to your AI subscriptions once - sessions are saved automatically.
        Use Browser mode for <span className="text-safe">FREE</span> AI access with your existing subscriptions.
      </div>

      {configs.map((config) => (
        <div key={config.name} className="vault-panel-dark p-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{config.icon}</span>
            <div className="flex-1">
              <div className="heading-text text-sm">{config.label}</div>
              <div className="text-[11px] text-text-muted mt-1">{config.description}</div>
            </div>
            <button
              onClick={() => handleLaunch(config)}
              disabled={launching === config.name}
              aria-label={`Login to ${config.label}`}
              aria-busy={launching === config.name}
              className="vault-button px-4 disabled:opacity-50"
            >
              {launching === config.name ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ☢
                  </motion.span>
                  OPENING...
                </span>
              ) : (
                'LOGIN'
              )}
            </button>
          </div>
        </div>
      ))}

      <div className="text-[10px] text-text-muted mt-4 p-3 bg-vault-yellow/5 border border-vault-yellow/20 rounded">
        <strong className="text-vault-yellow">How it works:</strong> Click LOGIN to open the AI website.
        Sign in with your account. Your session is saved locally so you stay logged in.
        Then use BROWSER mode in the Task Router to chat for FREE!
      </div>
    </motion.div>
  );
}



// ═══════════════════════════════════════════════════════════════
// LOCAL TAB
// ═══════════════════════════════════════════════════════════════

function LocalConfigTab({ onSaved }: { onSaved?: () => void }) {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing config
  useEffect(() => {
    checkUrl();
  }, []);

  const checkUrl = async () => {
    try {
      const result = await invoke<{ success: boolean; data: Array<{ value: string | null }> | null }>('vault_get', {
        name: 'OLLAMA_URL',
      });
      if (result.success && result.data?.[0]?.value) {
        setOllamaUrl(result.data[0].value);
      }
    } catch {
      // Keep default
    }
  };

  const handleSave = async () => {
    if (!ollamaUrl.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await invoke<{ success: boolean; message: string }>('vault_add', {
        name: 'OLLAMA_URL',
        value: ollamaUrl.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Saved!' });
        onSaved?.();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Error: ${e}` });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="text-sm text-text-muted">
        Configure your local AI infrastructure. Bunker will use these settings to connect to your local models.
      </div>

      <div className="vault-panel-dark p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-3xl">🦙</div>
          <div className="flex-1 min-w-0">
            <h3 className="heading-text text-sm mb-1">Ollama API URL</h3>
            <p className="text-[11px] text-text-muted mb-3">
              The endpoint where your Ollama instance is running. Default is <span className="font-mono text-vault-yellow">http://localhost:11434</span>.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 bg-concrete-dark border border-border-warning/50 px-3 py-2
                  text-terminal-green font-mono text-sm
                  focus:border-vault-yellow focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="vault-button vault-button-small px-4"
              >
                {saving ? '...' : 'SAVE'}
              </button>
            </div>

            {message && (
              <div className={`text-[10px] mt-2 ${message.type === 'success' ? 'text-safe' : 'text-danger'}`}>
                {message.text}
              </div>
            )}

            {/* Quick Tips */}
            <div className="mt-4 p-2 bg-black/20 text-[10px] text-text-muted border border-white/5 rounded">
              <span className="text-vault-yellow font-bold">TIP:</span> Ensure Ollama is running (`ollama serve`).
              If running in Docker/WSL, you may need to check your network binding settings.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ConfigModal;

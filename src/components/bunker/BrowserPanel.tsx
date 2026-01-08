// ═══════════════════════════════════════════════════════════════
// BUNKER - Browser Panel
// Launch Comet browser with your extensions and sessions
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { open } from '@tauri-apps/plugin-shell';

interface QuickLaunch {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string;
}

const QUICK_LAUNCHES: QuickLaunch[] = [
  {
    id: 'perplexity',
    name: 'PERPLEXITY',
    icon: '🔍',
    url: 'https://perplexity.ai',
    description: 'Search with Comet Assistant',
  },
  {
    id: 'claude',
    name: 'CLAUDE',
    icon: '🧠',
    url: 'https://claude.ai',
    description: 'Chat with Claude extension',
  },
  {
    id: 'chatgpt',
    name: 'CHATGPT',
    icon: '💬',
    url: 'https://chat.openai.com',
    description: 'OpenAI ChatGPT',
  },
  {
    id: 'n8n',
    name: 'N8N',
    icon: '⚡',
    url: 'http://localhost:5678',
    description: 'Workflow automation',
  },
];

export function BrowserPanel() {
  const [customUrl, setCustomUrl] = useState('');
  const [launching, setLaunching] = useState<string | null>(null);

  const launchBrowser = async (url: string, id?: string) => {
    if (id) setLaunching(id);

    try {
      // Open URL in default browser (set Comet as default for extensions)
      await open(url);
    } catch (e) {
      console.error('Failed to launch browser:', e);
    }

    setTimeout(() => setLaunching(null), 1000);
  };

  const handleCustomLaunch = () => {
    if (!customUrl.trim()) return;
    let url = customUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    launchBrowser(url, 'custom');
    setCustomUrl('');
  };

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50 flex-shrink-0">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <span className="text-vault-yellow">🌐</span>
          COMET BROWSER
        </h2>
        <p className="text-[10px] text-text-muted mt-1">
          Launch with your extensions & sessions
        </p>
      </div>

      {/* Quick Launch Grid */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {QUICK_LAUNCHES.map((item) => (
            <button
              key={item.id}
              onClick={() => launchBrowser(item.url, item.id)}
              disabled={launching === item.id}
              aria-label={`Launch ${item.name}: ${item.description}`}
              aria-busy={launching === item.id}
              className={`
                vault-panel-dark p-3 text-left transition-all
                hover:border-vault-yellow/50 hover:bg-vault-yellow/5
                ${launching === item.id ? 'border-safe/50 bg-safe/10' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{item.icon}</span>
                <span className="heading-text text-xs">{item.name}</span>
              </div>
              <p className="text-[9px] text-text-muted">{item.description}</p>
              {launching === item.id && (
                <span className="text-[9px] text-safe mt-1 block">Launching...</span>
              )}
            </button>
          ))}
        </div>

        {/* Custom URL */}
        <div className="vault-panel-dark p-3">
          <label htmlFor="custom-url-input" className="heading-text text-[10px] text-text-muted mb-2 block">
            CUSTOM URL
          </label>
          <div className="flex gap-2">
            <input
              id="custom-url-input"
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomLaunch()}
              placeholder="Enter URL..."
              aria-describedby="custom-url-hint"
              className="flex-1 bg-concrete-dark border border-border-warning/50 px-3 py-2
                text-terminal-green font-mono text-xs
                focus:border-vault-yellow focus:outline-none"
            />
            <button
              onClick={handleCustomLaunch}
              disabled={!customUrl.trim()}
              aria-label="Navigate to custom URL"
              className="vault-button vault-button-small px-4 disabled:opacity-50"
            >
              GO
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-border-warning/30 bg-concrete-dark/50 flex-shrink-0">
        <p id="custom-url-hint" className="text-[9px] text-text-muted text-center">
          Opens in Comet with Claude extension + Comet Assistant
        </p>
      </div>
    </div>
  );
}

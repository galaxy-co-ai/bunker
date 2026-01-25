"use client";

import { useState, useEffect } from "react";
import {
  Cable,
  Github,
  Triangle,
  Send,
  Check,
  Loader2,
  Link2,
  Sparkles,
  Settings2,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

interface ConnectorConfig {
  github: { token: string };
  openai: { apiKey: string };
  anthropic: { apiKey: string };
  ollama: { baseUrl: string };
  vercel: { token: string };
  neon: Record<string, never>;
  telegram: { botToken: string; chatId: string };
}

type ConnectorType = keyof ConnectorConfig;

interface Connector {
  id: string;
  type: ConnectorType;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconClassName?: string;
  connected: boolean;
  dbId?: string;
  lastMessage?: string;
}

interface Integration {
  id: string;
  type: string;
  name: string;
  config: string | null;
  connected: number;
  lastChecked: string | null;
}

const defaultConnectors: Connector[] = [
  {
    id: "github",
    type: "github",
    name: "GitHub",
    description: "Repository & version control",
    icon: <Github className="h-6 w-6" />,
    iconClassName: "dark:invert",
    connected: false,
  },
  {
    id: "openai",
    type: "openai",
    name: "OpenAI",
    description: "GPT models & API access",
    icon: (
      <img
        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/openai-icon.svg"
        alt="OpenAI"
        className="h-6 w-6 dark:invert"
      />
    ),
    connected: false,
  },
  {
    id: "anthropic",
    type: "anthropic",
    name: "Anthropic",
    description: "Claude models & API access",
    icon: <Sparkles className="h-6 w-6" />,
    connected: false,
  },
  {
    id: "ollama",
    type: "ollama",
    name: "Ollama",
    description: "Local AI models",
    icon: (
      <img
        src="https://ollama.com/public/ollama.png"
        alt="Ollama"
        className="h-6 w-6"
      />
    ),
    connected: false,
  },
  {
    id: "vercel",
    type: "vercel",
    name: "Vercel",
    description: "Deployment & hosting",
    icon: <Triangle className="h-6 w-6" />,
    iconClassName: "dark:invert",
    connected: false,
  },
  {
    id: "neon",
    type: "neon",
    name: "Neon",
    description: "Postgres database",
    icon: (
      <img
        src="https://neon.tech/favicon/favicon.svg"
        alt="Neon"
        className="h-6 w-6"
      />
    ),
    connected: false,
  },
  {
    id: "telegram",
    type: "telegram",
    name: "Telegram",
    description: "Bot notifications for Titus",
    icon: <Send className="h-6 w-6" />,
    connected: false,
  },
];

interface ConnectorsPanelProps {
  trigger?: React.ReactNode;
  collapsed?: boolean;
}

export function ConnectorsPanel({ trigger, collapsed }: ConnectorsPanelProps) {
  const [connectors, setConnectors] = useState<Connector[]>(defaultConnectors);
  const [configuring, setConfiguring] = useState<ConnectorType | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Config form state
  const [githubToken, setGithubToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [vercelToken, setVercelToken] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Password visibility
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Load integrations on mount
  useEffect(() => {
    async function loadIntegrations() {
      try {
        const response = await fetch("/api/integrations");
        if (!response.ok) throw new Error("Failed to load integrations");

        const data = await response.json();
        const integrationsByType: Record<string, Integration> = {};

        for (const integration of data.integrations) {
          integrationsByType[integration.type] = integration;
        }

        setConnectors((prev) =>
          prev.map((connector) => {
            const integration = integrationsByType[connector.type];
            if (integration) {
              // Pre-fill config if exists
              if (integration.config) {
                try {
                  const config = JSON.parse(integration.config);
                  switch (connector.type) {
                    case "github":
                      setGithubToken(config.token || "");
                      break;
                    case "openai":
                      setOpenaiKey(config.apiKey || "");
                      break;
                    case "anthropic":
                      setAnthropicKey(config.apiKey || "");
                      break;
                    case "ollama":
                      setOllamaUrl(config.baseUrl || "http://localhost:11434");
                      break;
                    case "vercel":
                      setVercelToken(config.token || "");
                      break;
                    case "telegram":
                      setTelegramBotToken(config.botToken || "");
                      setTelegramChatId(config.chatId || "");
                      break;
                  }
                } catch {
                  // Ignore parse errors
                }
              }
              return {
                ...connector,
                connected: integration.connected === 1,
                dbId: integration.id,
              };
            }
            return connector;
          })
        );
      } catch (error) {
        console.error("Failed to load integrations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadIntegrations();
  }, []);

  const getConfigForType = (type: ConnectorType): string => {
    switch (type) {
      case "github":
        return JSON.stringify({ token: githubToken });
      case "openai":
        return JSON.stringify({ apiKey: openaiKey });
      case "anthropic":
        return JSON.stringify({ apiKey: anthropicKey });
      case "ollama":
        return JSON.stringify({ baseUrl: ollamaUrl });
      case "vercel":
        return JSON.stringify({ token: vercelToken });
      case "neon":
        return JSON.stringify({});
      case "telegram":
        return JSON.stringify({ botToken: telegramBotToken, chatId: telegramChatId });
    }
  };

  const handleSaveConfig = async (type: ConnectorType) => {
    setSaving(true);
    const connector = connectors.find((c) => c.type === type);
    if (!connector) return;

    try {
      const config = getConfigForType(type);

      if (connector.dbId) {
        // Update existing
        const response = await fetch(`/api/integrations/${connector.dbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        });

        if (!response.ok) throw new Error("Failed to update integration");

        toast.success("Configuration saved", `${connector.name} configuration updated`);
      } else {
        // Create new
        const response = await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            name: connector.name,
            config,
          }),
        });

        if (!response.ok) throw new Error("Failed to create integration");

        const data = await response.json();
        setConnectors((prev) =>
          prev.map((c) =>
            c.type === type ? { ...c, dbId: data.integration.id } : c
          )
        );

        toast.success("Configuration saved", `${connector.name} configuration created`);
      }
    } catch (error) {
      toast.error("Error", "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (type: ConnectorType) => {
    const connector = connectors.find((c) => c.type === type);
    if (!connector) return;

    // Save config first if not saved
    if (!connector.dbId) {
      await handleSaveConfig(type);
    }

    // Get updated connector with dbId
    const updatedConnector = connectors.find((c) => c.type === type);
    if (!updatedConnector?.dbId) {
      toast.error("Error", "Please save configuration first");
      return;
    }

    setTesting(type);

    try {
      const response = await fetch(`/api/integrations/${updatedConnector.dbId}/test`, {
        method: "POST",
      });

      const data = await response.json();

      setConnectors((prev) =>
        prev.map((c) =>
          c.type === type
            ? {
                ...c,
                connected: data.test?.success ?? false,
                lastMessage: data.test?.message,
              }
            : c
        )
      );

      if (data.test?.success) {
        toast.success("Connection successful", data.test.message);
      } else {
        toast.error("Connection failed", data.test?.message || "Unknown error");
      }
    } catch (error) {
      toast.error("Error", "Failed to test connection");
    } finally {
      setTesting(null);
    }
  };

  const handleDisconnect = async (type: ConnectorType) => {
    const connector = connectors.find((c) => c.type === type);
    if (!connector?.dbId) return;

    try {
      const response = await fetch(`/api/integrations/${connector.dbId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete integration");

      setConnectors((prev) =>
        prev.map((c) =>
          c.type === type ? { ...c, connected: false, dbId: undefined } : c
        )
      );

      // Clear form fields
      switch (type) {
        case "github":
          setGithubToken("");
          break;
        case "openai":
          setOpenaiKey("");
          break;
        case "anthropic":
          setAnthropicKey("");
          break;
        case "ollama":
          setOllamaUrl("http://localhost:11434");
          break;
        case "vercel":
          setVercelToken("");
          break;
        case "telegram":
          setTelegramBotToken("");
          setTelegramChatId("");
          break;
      }

      toast.success("Disconnected", `${connector.name} has been disconnected`);
      setConfiguring(null);
    } catch (error) {
      toast.error("Error", "Failed to disconnect");
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderConfigForm = (type: ConnectorType) => {
    const connector = connectors.find((c) => c.type === type);

    switch (type) {
      case "github":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token">Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="github-token"
                  type={showSecrets["github-token"] ? "text" : "password"}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("github-token")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets["github-token"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a token at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>
          </div>
        );

      case "openai":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showSecrets["openai-key"] ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("openai-key")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets["openai-key"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
          </div>
        );

      case "anthropic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anthropic-key">API Key</Label>
              <div className="relative">
                <Input
                  id="anthropic-key"
                  type={showSecrets["anthropic-key"] ? "text" : "password"}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("anthropic-key")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets["anthropic-key"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
          </div>
        );

      case "ollama":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Base URL</Label>
              <Input
                id="ollama-url"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-muted-foreground">
                Default is http://localhost:11434. Make sure Ollama is running.
              </p>
            </div>
          </div>
        );

      case "vercel":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vercel-token">Access Token</Label>
              <div className="relative">
                <Input
                  id="vercel-token"
                  type={showSecrets["vercel-token"] ? "text" : "password"}
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("vercel-token")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets["vercel-token"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a token at{" "}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  vercel.com/account/tokens
                </a>
              </p>
            </div>
          </div>
        );

      case "neon":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Already Configured</p>
                <p className="text-xs text-muted-foreground">
                  Neon is configured via DATABASE_URL environment variable.
                </p>
              </div>
            </div>
          </div>
        );

      case "telegram":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-bot-token">Bot Token</Label>
              <div className="relative">
                <Input
                  id="telegram-bot-token"
                  type={showSecrets["telegram-bot-token"] ? "text" : "password"}
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="123456789:ABC..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility("telegram-bot-token")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecrets["telegram-bot-token"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get a bot token from{" "}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  @BotFather
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram-chat-id">Chat ID</Label>
              <Input
                id="telegram-chat-id"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="-100123456789"
              />
              <p className="text-xs text-muted-foreground">
                The chat/channel ID where notifications will be sent.
              </p>
            </div>
          </div>
        );
    }
  };

  const connectedCount = connectors.filter((c) => c.connected).length;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                collapsed && "px-0 justify-center"
              )}
            >
              <Cable className="h-4 w-4" />
              {!collapsed && <span>Connectors</span>}
              {!collapsed && connectedCount > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {connectedCount}/{connectors.length}
                </span>
              )}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cable className="h-5 w-5" />
              Connectors
            </DialogTitle>
            <DialogDescription>
              Connect external services to enhance your workflow. Configure API
              keys and integrations for AI providers, version control, and more.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4 md:grid-cols-2">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center justify-between gap-4 rounded-xl p-3 border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg bg-muted",
                      connector.iconClassName
                    )}
                  >
                    {connector.icon}
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-1.5">
                      {connector.name}
                      {connector.connected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {connector.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfiguring(connector.type)}
                  disabled={isLoading}
                  className={cn(
                    "shrink-0 h-8 w-8",
                    connector.connected && "text-green-600 dark:text-green-400"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : connector.connected ? (
                    <Settings2 className="h-4 w-4" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={configuring !== null} onOpenChange={(open) => !open && setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configuring && (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {connectors.find((c) => c.type === configuring)?.icon}
                  </div>
                  Configure {connectors.find((c) => c.type === configuring)?.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {configuring === "neon"
                ? "Neon database connection is managed via environment variables."
                : "Enter your credentials to connect this service."}
            </DialogDescription>
          </DialogHeader>

          {configuring && renderConfigForm(configuring)}

          {configuring && connectors.find((c) => c.type === configuring)?.lastMessage && (
            <div
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg text-sm",
                connectors.find((c) => c.type === configuring)?.connected
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              {connectors.find((c) => c.type === configuring)?.connected ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {connectors.find((c) => c.type === configuring)?.lastMessage}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {configuring && connectors.find((c) => c.type === configuring)?.connected && (
              <Button
                variant="destructive"
                onClick={() => configuring && handleDisconnect(configuring)}
                className="w-full sm:w-auto"
              >
                Disconnect
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              {configuring !== "neon" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => configuring && handleSaveConfig(configuring)}
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save
                  </Button>
                  <Button
                    onClick={() => configuring && handleTestConnection(configuring)}
                    disabled={testing !== null}
                    className="flex-1 sm:flex-none"
                  >
                    {testing === configuring ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Test Connection
                  </Button>
                </>
              )}
              {configuring === "neon" && (
                <Button
                  onClick={() => configuring && handleTestConnection(configuring)}
                  disabled={testing !== null}
                  className="w-full"
                >
                  {testing === configuring ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Test Connection
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

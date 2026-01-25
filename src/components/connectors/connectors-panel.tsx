"use client";

import { useState } from "react";
import { Cable, Github, Triangle, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Connector {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconClassName?: string;
  connected: boolean;
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
    icon: (
      <img
        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/anthropic-icon.svg"
        alt="Anthropic"
        className="h-6 w-6 dark:invert"
      />
    ),
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
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (connectorId: string) => {
    setConnecting(connectorId);
    // Simulate connection - will be replaced with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connectorId ? { ...c, connected: !c.connected } : c
      )
    );
    setConnecting(null);
  };

  const connectedCount = connectors.filter((c) => c.connected).length;

  return (
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
                  <h3 className="font-medium">{connector.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {connector.description}
                  </p>
                </div>
              </div>
              <Button
                variant={connector.connected ? "secondary" : "default"}
                size="sm"
                onClick={() => handleConnect(connector.id)}
                disabled={connecting === connector.id}
                className="shrink-0"
              >
                {connecting === connector.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connector.connected ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { ChevronDown, Bot, Cloud, Server, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModels } from "@/hooks/use-chat";
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelInfo } from "@/app/api/models/route";

interface ModelSelectorProps {
  selectedModelId: string | null;
  onSelectModel: (modelId: string) => void;
}

const providerIcons = {
  ollama: Server,
  anthropic: Bot,
  openai: Cloud,
  clawdbot: Sparkles,
};

const providerLabels = {
  ollama: "Local (Ollama)",
  anthropic: "Anthropic",
  openai: "OpenAI",
  clawdbot: "Clawdbot",
};

export function ModelSelector({ selectedModelId, onSelectModel }: ModelSelectorProps) {
  const { data, isLoading, error } = useModels();

  if (isLoading) {
    return <Skeleton className="h-9 w-48" />;
  }

  if (error || !data) {
    return (
      <Button variant="outline" disabled className="w-48 justify-between">
        <span className="text-muted-foreground">No models available</span>
      </Button>
    );
  }

  const { models } = data as { models: ModelInfo[] };
  const availableModels = models.filter((m) => m.available);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Group models by provider
  const clawdbotModels = availableModels.filter((m) => m.provider === "clawdbot");
  const ollamaModels = availableModels.filter((m) => m.provider === "ollama");
  const anthropicModels = availableModels.filter((m) => m.provider === "anthropic");
  const openaiModels = availableModels.filter((m) => m.provider === "openai");

  if (availableModels.length === 0) {
    return (
      <Button variant="outline" disabled className="w-48 justify-between">
        <span className="text-muted-foreground">No models configured</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          <span className="truncate">
            {selectedModel?.name || "Select model"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {clawdbotModels.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {providerLabels.clawdbot}
            </DropdownMenuLabel>
            {clawdbotModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span>{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        {ollamaModels.length > 0 && (
          <>
            {clawdbotModels.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                {providerLabels.ollama}
              </DropdownMenuLabel>
              {ollamaModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {anthropicModels.length > 0 && (
          <>
            {(clawdbotModels.length > 0 || ollamaModels.length > 0) && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {providerLabels.anthropic}
              </DropdownMenuLabel>
              {anthropicModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {openaiModels.length > 0 && (
          <>
            {(clawdbotModels.length > 0 || ollamaModels.length > 0 || anthropicModels.length > 0) && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                {providerLabels.openai}
              </DropdownMenuLabel>
              {openaiModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

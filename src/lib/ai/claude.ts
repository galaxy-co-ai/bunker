import { createAnthropic } from "@ai-sdk/anthropic";

// Claude/Anthropic available models
export const CLAUDE_MODELS = [
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    description: "Best balance of speed and capability",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    description: "Fast and capable for most tasks",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    description: "Fastest model for quick tasks",
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude Opus 4",
    description: "Most capable model for complex tasks",
  },
] as const;

export type ClaudeModelId = (typeof CLAUDE_MODELS)[number]["id"];

// Create Claude provider with API key
export function createClaudeProvider(apiKey: string) {
  return createAnthropic({
    apiKey,
  });
}

// Check if Claude API key is valid
export async function validateClaudeApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    // 200 means valid, 401 means invalid key
    return response.status === 200;
  } catch {
    return false;
  }
}

// Get list of available Claude models
export function listClaudeModels() {
  return CLAUDE_MODELS.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    provider: "anthropic" as const,
  }));
}

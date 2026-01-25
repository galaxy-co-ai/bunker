import { createOpenAI } from "@ai-sdk/openai";

// OpenAI available models
export const OPENAI_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Most capable GPT-4 model with vision",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast and affordable for simple tasks",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "High capability with 128k context",
  },
  {
    id: "o1",
    name: "o1",
    description: "Reasoning model for complex problems",
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    description: "Fast reasoning model",
  },
] as const;

export type OpenAIModelId = (typeof OPENAI_MODELS)[number]["id"];

// Create OpenAI provider with API key
export function createOpenAIProvider(apiKey: string) {
  return createOpenAI({
    apiKey,
  });
}

// Check if OpenAI API key is valid
export async function validateOpenAIApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

// Get list of available OpenAI models
export function listOpenAIModels() {
  return OPENAI_MODELS.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    provider: "openai" as const,
  }));
}

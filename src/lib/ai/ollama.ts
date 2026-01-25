import { createOpenAI } from "@ai-sdk/openai";

// Ollama exposes an OpenAI-compatible API endpoint
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";

export interface OllamaModel {
  name: string;
  modifiedAt: string;
  size: number;
}

export interface OllamaListResponse {
  models: Array<{
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      format: string;
      family: string;
      parameter_size: string;
      quantization_level: string;
    };
  }>;
}

// Create Ollama provider using OpenAI-compatible endpoint
export function createOllamaProvider() {
  return createOpenAI({
    baseURL: OLLAMA_BASE_URL,
    apiKey: "ollama", // Ollama doesn't require a key but the SDK needs something
  });
}

// List available Ollama models
export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    // Use the native Ollama API for listing models (not OpenAI-compatible endpoint)
    const baseUrl = OLLAMA_BASE_URL.replace("/v1", "");
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to list Ollama models: ${response.statusText}`);
    }

    const data: OllamaListResponse = await response.json();
    return data.models.map((model) => ({
      name: model.name,
      modifiedAt: model.modified_at,
      size: model.size,
    }));
  } catch (error) {
    // If Ollama is not running, return empty array
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("Ollama is not running or not accessible");
      return [];
    }
    throw error;
  }
}

// Check if Ollama is available
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const baseUrl = OLLAMA_BASE_URL.replace("/v1", "");
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

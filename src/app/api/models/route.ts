import { NextResponse } from "next/server";
import { db, settings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { listOllamaModels, isOllamaAvailable } from "@/lib/ai/ollama";
import { listClaudeModels } from "@/lib/ai/claude";
import { listOpenAIModels } from "@/lib/ai/openai";

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  provider: "ollama" | "anthropic" | "openai";
  available: boolean;
}

// GET /api/models - Get available models from all configured providers
export async function GET() {
  try {
    const models: ModelInfo[] = [];

    // Check for API keys in settings
    const anthropicKeySetting = db
      .select()
      .from(settings)
      .where(eq(settings.key, "anthropic_api_key"))
      .get();

    const openaiKeySetting = db
      .select()
      .from(settings)
      .where(eq(settings.key, "openai_api_key"))
      .get();

    const hasAnthropicKey = !!anthropicKeySetting?.value;
    const hasOpenAIKey = !!openaiKeySetting?.value;

    // Get Ollama models (always check, as it's local)
    const ollamaAvailable = await isOllamaAvailable();
    if (ollamaAvailable) {
      const ollamaModels = await listOllamaModels();
      for (const model of ollamaModels) {
        models.push({
          id: model.name,
          name: model.name,
          description: `Local model (${formatSize(model.size)})`,
          provider: "ollama",
          available: true,
        });
      }
    }

    // Add Claude models
    const claudeModels = listClaudeModels();
    for (const model of claudeModels) {
      models.push({
        id: model.id,
        name: model.name,
        description: model.description,
        provider: "anthropic",
        available: hasAnthropicKey,
      });
    }

    // Add OpenAI models
    const openaiModels = listOpenAIModels();
    for (const model of openaiModels) {
      models.push({
        id: model.id,
        name: model.name,
        description: model.description,
        provider: "openai",
        available: hasOpenAIKey,
      });
    }

    return NextResponse.json({
      models,
      providers: {
        ollama: { available: ollamaAvailable, configured: true },
        anthropic: { available: hasAnthropicKey, configured: hasAnthropicKey },
        openai: { available: hasOpenAIKey, configured: hasOpenAIKey },
      },
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch models" } },
      { status: 500 }
    );
  }
}

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)}GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
}

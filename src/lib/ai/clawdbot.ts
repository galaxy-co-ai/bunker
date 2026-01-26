import { createOpenAI } from "@ai-sdk/openai";

// Clawdbot model definition
export const CLAWDBOT_MODELS = [
  {
    id: "clawdbot:main",
    name: "Clawdbot",
    description: "AI with memory, tools, and multi-agent capabilities",
  },
] as const;

export type ClawdbotModelId = (typeof CLAWDBOT_MODELS)[number]["id"];

// Create Clawdbot provider using OpenAI-compatible endpoint
export function createClawdbotProvider(options?: {
  sessionKey?: string;
  agentId?: string;
}) {
  const baseURL = process.env.CLAWDBOT_GATEWAY_URL || "http://127.0.0.1:18789";
  const apiKey = process.env.CLAWDBOT_GATEWAY_TOKEN || "";
  const agentId = options?.agentId || process.env.CLAWDBOT_AGENT_ID || "main";

  const headers: Record<string, string> = {
    "x-clawdbot-agent-id": agentId,
  };

  // Add session key for persistent memory if provided
  if (options?.sessionKey) {
    headers["x-clawdbot-session-key"] = options.sessionKey;
  }

  return createOpenAI({
    baseURL: `${baseURL}/v1`,
    apiKey,
    headers,
  });
}

// Check if Clawdbot Gateway is available
export async function isClawdbotAvailable(): Promise<boolean> {
  const baseURL = process.env.CLAWDBOT_GATEWAY_URL || "http://127.0.0.1:18789";
  const apiKey = process.env.CLAWDBOT_GATEWAY_TOKEN || "";

  try {
    const response = await fetch(`${baseURL}/v1/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Validate Clawdbot connection
export async function validateClawdbotConnection(): Promise<boolean> {
  return isClawdbotAvailable();
}

// Get list of Clawdbot models
export function listClawdbotModels() {
  return CLAWDBOT_MODELS.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    provider: "clawdbot" as const,
  }));
}

// Helper to create session key for Bunker
export function createBunkerSessionKey(projectId: string, conversationId?: string): string {
  if (conversationId) {
    return `bunker:project:${projectId}:conversation:${conversationId}`;
  }
  return `bunker:project:${projectId}`;
}

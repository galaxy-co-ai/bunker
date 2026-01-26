import { NextRequest } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { db, conversations, messages, settings, integrations, projects, type Conversation } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createOllamaProvider } from "@/lib/ai/ollama";
import { createClaudeProvider } from "@/lib/ai/claude";
import { createOpenAIProvider } from "@/lib/ai/openai";
import { createClawdbotProvider, createBunkerSessionKey } from "@/lib/ai/clawdbot";
import { sendMessage, formatBunkerMessage, getChatId } from "@/lib/telegram/client";

const chatRequestSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1),
  modelId: z.string(),
  context: z.string().optional(),
});

type Provider = "ollama" | "anthropic" | "openai" | "clawdbot" | "telegram";

function getProviderFromModelId(modelId: string): Provider {
  // Check for Telegram first (sends via Telegram to Titus)
  if (modelId.startsWith("telegram:")) {
    return "telegram";
  }
  // Check for Clawdbot (explicit selection)
  if (modelId.startsWith("clawdbot")) {
    return "clawdbot";
  }
  if (modelId.startsWith("claude")) {
    return "anthropic";
  }
  if (modelId.startsWith("gpt") || modelId.startsWith("o1")) {
    return "openai";
  }
  return "ollama";
}

// Check if Clawdbot should be used as the primary provider
function shouldUseClawdbot(): boolean {
  return process.env.AI_PROVIDER === "clawdbot" || !!process.env.CLAWDBOT_GATEWAY_URL;
}

async function getApiKey(provider: Provider): Promise<string | null> {
  if (provider === "ollama") {
    return "ollama"; // Ollama doesn't need a key
  }

  if (provider === "clawdbot") {
    // Clawdbot uses its own token from env
    return process.env.CLAWDBOT_GATEWAY_TOKEN || "clawdbot";
  }

  if (provider === "telegram") {
    // Telegram uses bot token from env
    return process.env.TELEGRAM_BOT_TOKEN || null;
  }

  // First check env vars (highest priority for deployment)
  const envKeyName = provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY";
  if (process.env[envKeyName]) {
    return process.env[envKeyName]!;
  }

  // Then check settings table (backwards compatible)
  const keyName = provider === "anthropic" ? "anthropic_api_key" : "openai_api_key";
  const [setting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, keyName));

  if (setting?.value) {
    return setting.value;
  }

  // Fallback to integrations table (connectors)
  const integrationType = provider === "anthropic" ? "anthropic" : "openai";
  const [integration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.type, integrationType));

  if (integration?.config) {
    try {
      const config = JSON.parse(integration.config);
      return config.apiKey || null;
    } catch {
      return null;
    }
  }

  return null;
}

// POST /api/chat - Send a message and get streaming AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = chatRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { conversationId, message, modelId, context } = result.data;

    // Verify conversation exists
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: { code: "NOT_FOUND", message: "Conversation not found" } }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine provider and get API key
    const provider = getProviderFromModelId(modelId);
    const apiKey = await getApiKey(provider);

    if (!apiKey && provider !== "ollama") {
      return new Response(
        JSON.stringify({
          error: {
            code: "NO_API_KEY",
            message: `No API key configured for ${provider}. Please add your API key in Settings.`,
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle Telegram provider differently - send to Telegram and return immediately
    if (provider === "telegram") {
      return await handleTelegramMessage(conversationId, message, conversation, context);
    }

    // Save user message to database
    const userMessageId = crypto.randomUUID();
    const now = new Date();

    await db.insert(messages)
      .values({
        id: userMessageId,
        conversationId,
        role: "user",
        content: message,
        createdAt: now,
      });

    // Update conversation timestamp
    await db.update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    // Get previous messages for context
    const previousMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    // Build messages array for AI
    const aiMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    // Add system context if provided
    if (context) {
      aiMessages.push({
        role: "system",
        content: context,
      });
    }

    // Add previous messages (excluding the one we just added)
    for (const msg of previousMessages) {
      if (msg.id !== userMessageId && (msg.role === "user" || msg.role === "assistant")) {
        aiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message
    aiMessages.push({
      role: "user",
      content: message,
    });

    // Create the appropriate provider
    let aiProvider;
    let effectiveModelId = modelId;

    if (provider === "clawdbot") {
      // Use Clawdbot with session persistence
      const sessionKey = createBunkerSessionKey(conversation.projectId, conversationId);
      aiProvider = createClawdbotProvider({ sessionKey });
      // Clawdbot uses its own model naming
      effectiveModelId = modelId.startsWith("clawdbot") ? modelId : "clawdbot:main";
    } else if (provider === "anthropic") {
      aiProvider = createClaudeProvider(apiKey!);
    } else if (provider === "openai") {
      aiProvider = createOpenAIProvider(apiKey!);
    } else {
      aiProvider = createOllamaProvider();
    }

    // Stream the response
    const streamResult = streamText({
      model: aiProvider(effectiveModelId),
      messages: aiMessages,
      onFinish: async ({ text }) => {
        // Save assistant message to database
        const assistantMessageId = crypto.randomUUID();
        await db.insert(messages)
          .values({
            id: assistantMessageId,
            conversationId,
            role: "assistant",
            content: text,
            createdAt: new Date(),
          });

        // Update conversation with model used
        await db.update(conversations)
          .set({
            modelId,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId));
      },
    });

    return streamResult.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: { code: "CHAT_FAILED", message: "Failed to process chat" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle Telegram provider - send message via Telegram instead of streaming AI
 * Response will come back via webhook
 */
async function handleTelegramMessage(
  conversationId: string,
  message: string,
  conversation: Conversation,
  context?: string
): Promise<Response> {
  try {
    // Get project name for the Bunker prefix
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, conversation.projectId));

    if (!project) {
      return new Response(
        JSON.stringify({ error: { code: "NOT_FOUND", message: "Project not found" } }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save user message to database
    const userMessageId = crypto.randomUUID();
    const now = new Date();

    await db.insert(messages).values({
      id: userMessageId,
      conversationId,
      role: "user",
      content: message,
      createdAt: now,
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: now, modelId: "telegram:titus" })
      .where(eq(conversations.id, conversationId));

    // Format message with Bunker prefix
    const formattedMessage = formatBunkerMessage(project.name, message, {
      conversationTitle: conversation.title || undefined,
    });

    // Get chat ID and send to Telegram
    const chatId = getChatId();
    const telegramMessage = await sendMessage(chatId, formattedMessage, {
      parse_mode: "Markdown",
    });

    // Return success - response will come via webhook
    return new Response(
      JSON.stringify({
        success: true,
        messageId: userMessageId,
        telegramMessageId: telegramMessage.message_id,
        status: "sent",
        pendingResponse: true,
        provider: "telegram",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Telegram send error:", error);

    // Check for specific errors
    if (error instanceof Error) {
      if (error.message.includes("TELEGRAM_BOT_TOKEN")) {
        return new Response(
          JSON.stringify({
            error: {
              code: "CONFIG_ERROR",
              message: "Telegram bot token not configured. Add TELEGRAM_BOT_TOKEN to environment.",
            },
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      if (error.message.includes("TELEGRAM_CHAT_ID")) {
        return new Response(
          JSON.stringify({
            error: {
              code: "CONFIG_ERROR",
              message: "Telegram chat ID not configured. Add TELEGRAM_CHAT_ID to environment.",
            },
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: { code: "TELEGRAM_ERROR", message: "Failed to send message to Telegram" } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

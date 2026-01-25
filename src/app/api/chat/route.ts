import { NextRequest } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { db, conversations, messages, settings } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createOllamaProvider } from "@/lib/ai/ollama";
import { createClaudeProvider } from "@/lib/ai/claude";
import { createOpenAIProvider } from "@/lib/ai/openai";

const chatRequestSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1),
  modelId: z.string(),
  context: z.string().optional(),
});

type Provider = "ollama" | "anthropic" | "openai";

function getProviderFromModelId(modelId: string): Provider {
  if (modelId.startsWith("claude")) {
    return "anthropic";
  }
  if (modelId.startsWith("gpt") || modelId.startsWith("o1")) {
    return "openai";
  }
  return "ollama";
}

function getApiKey(provider: Provider): string | null {
  if (provider === "ollama") {
    return "ollama"; // Ollama doesn't need a key
  }

  const keyName = provider === "anthropic" ? "anthropic_api_key" : "openai_api_key";
  const setting = db
    .select()
    .from(settings)
    .where(eq(settings.key, keyName))
    .get();

  return setting?.value || null;
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
    const conversation = db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .get();

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: { code: "NOT_FOUND", message: "Conversation not found" } }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine provider and get API key
    const provider = getProviderFromModelId(modelId);
    const apiKey = getApiKey(provider);

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

    // Save user message to database
    const userMessageId = crypto.randomUUID();
    const now = new Date();

    db.insert(messages)
      .values({
        id: userMessageId,
        conversationId,
        role: "user",
        content: message,
        createdAt: now,
      })
      .run();

    // Update conversation timestamp
    db.update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId))
      .run();

    // Get previous messages for context
    const previousMessages = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .all();

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
    if (provider === "anthropic") {
      aiProvider = createClaudeProvider(apiKey!);
    } else if (provider === "openai") {
      aiProvider = createOpenAIProvider(apiKey!);
    } else {
      aiProvider = createOllamaProvider();
    }

    // Stream the response
    const streamResult = streamText({
      model: aiProvider(modelId),
      messages: aiMessages,
      onFinish: async ({ text }) => {
        // Save assistant message to database
        const assistantMessageId = crypto.randomUUID();
        db.insert(messages)
          .values({
            id: assistantMessageId,
            conversationId,
            role: "assistant",
            content: text,
            createdAt: new Date(),
          })
          .run();

        // Update conversation with model used
        db.update(conversations)
          .set({
            modelId,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId))
          .run();
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

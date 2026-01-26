import { NextRequest, NextResponse } from "next/server";
import { db, conversations, messages, integrations } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import {
  validateWebhookSecret,
  type TelegramUpdate,
  type TelegramMessage,
} from "@/lib/telegram/client";
import { publish } from "@/lib/telegram/events";

// POST /api/telegram/webhook - Receive messages from Telegram
export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret
    const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (expectedSecret && !validateWebhookSecret(secretHeader, expectedSecret)) {
      console.warn("Invalid webhook secret received");
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      );
    }

    const update: TelegramUpdate = await request.json();

    // Handle message updates
    const telegramMessage = update.message || update.edited_message;
    if (!telegramMessage || !telegramMessage.text) {
      // Acknowledge but ignore non-text messages
      return NextResponse.json({ ok: true });
    }

    // Ignore messages from bots (except our own bot's messages which are relayed)
    // We want to capture messages FROM Titus (Clawdbot)
    const fromBot = telegramMessage.from?.is_bot;

    // Get the chat ID where this message came from
    const chatId = telegramMessage.chat.id.toString();
    const configuredChatId = process.env.TELEGRAM_CHAT_ID;

    // Only process messages from our configured chat
    if (configuredChatId && chatId !== configuredChatId) {
      console.log(`Ignoring message from unconfigured chat: ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    // Skip messages that look like they're from Bunker (our own messages)
    if (telegramMessage.text.startsWith("[Bunker:")) {
      console.log("Ignoring own Bunker message");
      return NextResponse.json({ ok: true });
    }

    // This is a response from Titus - find the matching conversation
    const conversationId = await findConversationForMessage(
      chatId,
      telegramMessage
    );

    if (!conversationId) {
      console.log("Could not match message to a conversation");
      return NextResponse.json({ ok: true });
    }

    // Save the assistant message to database
    const messageId = crypto.randomUUID();
    const now = new Date();

    await db.insert(messages).values({
      id: messageId,
      conversationId,
      role: "assistant",
      content: telegramMessage.text,
      createdAt: now,
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    // Broadcast to SSE subscribers
    publish({
      conversationId,
      message: {
        id: messageId,
        role: "assistant",
        content: telegramMessage.text,
        createdAt: now,
      },
    });

    console.log(`Saved Telegram message to conversation ${conversationId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true });
  }
}

/**
 * Find the conversation that should receive this message
 * Strategy:
 * 1. Look for the most recent conversation with a pending message to this chat
 * 2. Fall back to the most recently active conversation
 */
async function findConversationForMessage(
  chatId: string,
  telegramMessage: TelegramMessage
): Promise<string | null> {
  // If this is a reply to a message, try to match by the original message
  // This would require storing telegram_message_id in our messages table
  // For now, use a simpler approach: find the most recently updated conversation

  // Get the Telegram integration config to see if there's a linked project
  const [telegramIntegration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.type, "telegram"));

  if (telegramIntegration?.config) {
    try {
      const config = JSON.parse(telegramIntegration.config);
      // If the chat ID matches our configured chat, use linked project
      if (config.chatId === chatId && config.linkedProjectId) {
        // Find the most recent conversation for this project
        const [recentConversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.projectId, config.linkedProjectId))
          .orderBy(desc(conversations.updatedAt))
          .limit(1);

        if (recentConversation) {
          return recentConversation.id;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback: Find the most recently updated conversation
  // that has a user message (indicating it's been used with Telegram)
  const recentConversations = await db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
    .limit(5);

  for (const conv of recentConversations) {
    // Check if this conversation has recent user messages
    const [recentUserMessage] = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    // If the last message was from a user (pending response), this is likely it
    if (recentUserMessage && recentUserMessage.role === "user") {
      return conv.id;
    }
  }

  // Last resort: return the most recent conversation
  if (recentConversations.length > 0) {
    return recentConversations[0].id;
  }

  return null;
}

// GET /api/telegram/webhook - Webhook verification (Telegram doesn't use this, but useful for testing)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Telegram webhook endpoint is active",
  });
}

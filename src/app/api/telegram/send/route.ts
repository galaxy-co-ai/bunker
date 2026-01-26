import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, conversations, projects, messages } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  sendMessage,
  formatBunkerMessage,
  getChatId,
} from "@/lib/telegram/client";

const sendRequestSchema = z.object({
  conversationId: z.string(),
  message: z.string().min(1),
  context: z
    .object({
      sprintName: z.string().optional(),
      conversationTitle: z.string().optional(),
    })
    .optional(),
});

// POST /api/telegram/send - Send a message from Bunker to Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = sendRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            issues: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { conversationId, message, context } = result.data;

    // Get conversation and project info
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Conversation not found" } },
        { status: 404 }
      );
    }

    // Get project name for the prefix
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, conversation.projectId));

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    // Format message with Bunker prefix
    const formattedMessage = formatBunkerMessage(project.name, message, {
      ...context,
      conversationTitle: conversation.title || undefined,
    });

    // Get chat ID from config
    const chatId = getChatId();

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
      .set({ updatedAt: now })
      .where(eq(conversations.id, conversationId));

    // Send to Telegram
    const telegramMessage = await sendMessage(chatId, formattedMessage, {
      parse_mode: "Markdown",
    });

    return NextResponse.json({
      success: true,
      messageId: userMessageId,
      telegramMessageId: telegramMessage.message_id,
      status: "sent",
      pendingResponse: true,
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);

    // Check for specific Telegram errors
    if (error instanceof Error) {
      if (error.message.includes("TELEGRAM_BOT_TOKEN")) {
        return NextResponse.json(
          {
            error: {
              code: "CONFIG_ERROR",
              message: "Telegram bot token not configured",
            },
          },
          { status: 500 }
        );
      }
      if (error.message.includes("TELEGRAM_CHAT_ID")) {
        return NextResponse.json(
          {
            error: {
              code: "CONFIG_ERROR",
              message: "Telegram chat ID not configured",
            },
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: { code: "SEND_FAILED", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}

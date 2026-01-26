import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  setWebhook,
  deleteWebhook,
  getWebhookInfo,
  getMe,
} from "@/lib/telegram/client";

const setupRequestSchema = z.object({
  action: z.enum(["set", "delete", "info"]),
  webhookUrl: z.string().url().optional(),
});

// POST /api/telegram/setup - Configure Telegram webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = setupRequestSchema.safeParse(body);

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

    const { action, webhookUrl } = result.data;

    switch (action) {
      case "set": {
        if (!webhookUrl) {
          return NextResponse.json(
            {
              error: {
                code: "MISSING_URL",
                message: "webhookUrl is required for set action",
              },
            },
            { status: 400 }
          );
        }

        const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
        const success = await setWebhook(webhookUrl, secret);

        if (success) {
          return NextResponse.json({
            success: true,
            message: "Webhook configured successfully",
            webhookUrl,
          });
        } else {
          return NextResponse.json(
            {
              error: {
                code: "SETUP_FAILED",
                message: "Failed to set webhook",
              },
            },
            { status: 500 }
          );
        }
      }

      case "delete": {
        const success = await deleteWebhook();
        return NextResponse.json({
          success,
          message: success
            ? "Webhook removed successfully"
            : "Failed to remove webhook",
        });
      }

      case "info": {
        const info = await getWebhookInfo();
        return NextResponse.json({
          success: true,
          webhook: info,
        });
      }

      default:
        return NextResponse.json(
          { error: { code: "INVALID_ACTION", message: "Unknown action" } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Telegram setup error:", error);

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
    }

    return NextResponse.json(
      { error: { code: "SETUP_FAILED", message: "Failed to configure webhook" } },
      { status: 500 }
    );
  }
}

// GET /api/telegram/setup - Get current setup status
export async function GET() {
  try {
    // Check if bot token is configured
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        configured: false,
        message: "Bot token not configured",
      });
    }

    // Get bot info
    const bot = await getMe();

    // Get webhook info
    const webhookInfo = await getWebhookInfo();

    return NextResponse.json({
      configured: true,
      bot: {
        id: bot.id,
        username: bot.username,
        firstName: bot.first_name,
      },
      webhook: {
        url: webhookInfo.url || null,
        hasCustomCertificate: webhookInfo.has_custom_certificate,
        pendingUpdates: webhookInfo.pending_update_count,
        lastError: webhookInfo.last_error_message || null,
        lastErrorDate: webhookInfo.last_error_date
          ? new Date(webhookInfo.last_error_date * 1000).toISOString()
          : null,
      },
      chatId: process.env.TELEGRAM_CHAT_ID || null,
    });
  } catch (error) {
    console.error("Failed to get Telegram status:", error);
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

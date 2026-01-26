/**
 * Telegram Bot API client for Bunker
 * Handles sending messages, webhook management, and message formatting
 */

// Telegram Bot API types
export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  reply_to_message?: TelegramMessage;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_to_message_id?: number;
  disable_notification?: boolean;
}

export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
}

// Telegram API response wrapper
interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * Get the configured bot token
 */
export function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
  }
  return token;
}

/**
 * Get the configured chat ID for Bunker messages
 */
export function getChatId(): string {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID environment variable is not set");
  }
  return chatId;
}

/**
 * Make a request to the Telegram Bot API
 */
async function telegramApi<T>(
  method: string,
  params?: Record<string, unknown>
): Promise<T> {
  const token = getBotToken();
  const url = `https://api.telegram.org/bot${token}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: params ? JSON.stringify(params) : undefined,
  });

  const data: TelegramResponse<T> = await response.json();

  if (!data.ok) {
    throw new Error(
      `Telegram API error: ${data.description || "Unknown error"} (code: ${data.error_code})`
    );
  }

  return data.result as T;
}

/**
 * Send a message to a Telegram chat
 */
export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: SendMessageOptions
): Promise<TelegramMessage> {
  return telegramApi<TelegramMessage>("sendMessage", {
    chat_id: chatId,
    text,
    ...options,
  });
}

/**
 * Format a message with Bunker prefix for identification
 */
export function formatBunkerMessage(
  projectName: string,
  message: string,
  context?: {
    sprintName?: string;
    conversationTitle?: string;
  }
): string {
  let formatted = `[Bunker:${projectName}] ${message}`;

  if (context) {
    const contextParts: string[] = [];
    if (context.sprintName) {
      contextParts.push(`Sprint: "${context.sprintName}"`);
    }
    if (context.conversationTitle) {
      contextParts.push(`Topic: "${context.conversationTitle}"`);
    }
    if (contextParts.length > 0) {
      formatted += `\n\n📋 Context: ${contextParts.join(", ")}`;
    }
  }

  return formatted;
}

/**
 * Parse a Bunker-prefixed message to extract project info
 */
export function parseBunkerMessage(text: string): {
  isBunkerMessage: boolean;
  projectName?: string;
  message?: string;
} {
  const match = text.match(/^\[Bunker:([^\]]+)\]\s*([\s\S]*)/);
  if (!match) {
    return { isBunkerMessage: false };
  }
  return {
    isBunkerMessage: true,
    projectName: match[1],
    message: match[2].trim(),
  };
}

/**
 * Set up a webhook for receiving messages
 */
export async function setWebhook(
  url: string,
  secretToken?: string
): Promise<boolean> {
  return telegramApi<boolean>("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "edited_message"],
  });
}

/**
 * Remove the current webhook
 */
export async function deleteWebhook(): Promise<boolean> {
  return telegramApi<boolean>("deleteWebhook", {
    drop_pending_updates: false,
  });
}

/**
 * Get current webhook info
 */
export async function getWebhookInfo(): Promise<WebhookInfo> {
  return telegramApi<WebhookInfo>("getWebhookInfo");
}

/**
 * Get bot info (useful for testing connection)
 */
export async function getMe(): Promise<TelegramUser> {
  return telegramApi<TelegramUser>("getMe");
}

/**
 * Escape special characters for MarkdownV2 parse mode
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/**
 * Validate webhook request using secret token
 */
export function validateWebhookSecret(
  secretHeader: string | null,
  expectedSecret: string
): boolean {
  if (!secretHeader || !expectedSecret) {
    return false;
  }
  return secretHeader === expectedSecret;
}

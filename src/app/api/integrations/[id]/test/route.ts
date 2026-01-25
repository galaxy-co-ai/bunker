import { NextRequest, NextResponse } from "next/server";
import { db, integrations } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/integrations/[id]/test - Test connection for an integration
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));

    if (!integration) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Integration not found" } },
        { status: 404 }
      );
    }

    // Test connection based on integration type
    let testResult = { success: false, message: "Unknown integration type" };

    switch (integration.type) {
      case "github":
        testResult = await testGitHub(integration.config);
        break;
      case "openai":
        testResult = await testOpenAI(integration.config);
        break;
      case "anthropic":
        testResult = await testAnthropic(integration.config);
        break;
      case "ollama":
        testResult = await testOllama(integration.config);
        break;
      case "vercel":
        testResult = await testVercel(integration.config);
        break;
      case "neon":
        testResult = await testNeon(integration.config);
        break;
      case "telegram":
        testResult = await testTelegram(integration.config);
        break;
    }

    // Update integration status
    await db
      .update(integrations)
      .set({
        connected: testResult.success ? 1 : 0,
        lastChecked: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id));

    const [updated] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));

    return NextResponse.json({
      integration: updated,
      test: testResult,
    });
  } catch (error) {
    console.error("Failed to test integration:", error);
    return NextResponse.json(
      { error: { code: "TEST_FAILED", message: "Failed to test integration" } },
      { status: 500 }
    );
  }
}

// Test functions for each integration type
async function testGitHub(config: string | null): Promise<{ success: boolean; message: string }> {
  if (!config) return { success: false, message: "No configuration provided" };
  try {
    const { token } = JSON.parse(config);
    if (!token) return { success: false, message: "No token provided" };

    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });

    if (response.ok) {
      const user = await response.json();
      return { success: true, message: `Connected as ${user.login}` };
    }
    return { success: false, message: "Invalid token" };
  } catch {
    return { success: false, message: "Failed to parse configuration" };
  }
}

async function testOpenAI(config: string | null): Promise<{ success: boolean; message: string }> {
  if (!config) return { success: false, message: "No configuration provided" };
  try {
    const { apiKey } = JSON.parse(config);
    if (!apiKey) return { success: false, message: "No API key provided" };

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      return { success: true, message: "API key is valid" };
    }
    return { success: false, message: "Invalid API key" };
  } catch {
    return { success: false, message: "Failed to parse configuration" };
  }
}

async function testAnthropic(config: string | null): Promise<{ success: boolean; message: string }> {
  if (!config) return { success: false, message: "No configuration provided" };
  try {
    const { apiKey } = JSON.parse(config);
    if (!apiKey) return { success: false, message: "No API key provided" };

    // Anthropic doesn't have a simple validation endpoint, so we just check format
    if (apiKey.startsWith("sk-ant-")) {
      return { success: true, message: "API key format is valid" };
    }
    return { success: false, message: "Invalid API key format" };
  } catch {
    return { success: false, message: "Failed to parse configuration" };
  }
}

async function testOllama(config: string | null): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = config ? JSON.parse(config).baseUrl : "http://localhost:11434";
    const response = await fetch(`${baseUrl}/api/tags`);

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
      return { success: true, message: `Connected, ${modelCount} models available` };
    }
    return { success: false, message: "Ollama server not responding" };
  } catch {
    return { success: false, message: "Failed to connect to Ollama" };
  }
}

async function testVercel(config: string | null): Promise<{ success: boolean; message: string }> {
  if (!config) return { success: false, message: "No configuration provided" };
  try {
    const { token } = JSON.parse(config);
    if (!token) return { success: false, message: "No token provided" };

    const response = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const user = await response.json();
      return { success: true, message: `Connected as ${user.user.username}` };
    }
    return { success: false, message: "Invalid token" };
  } catch {
    return { success: false, message: "Failed to parse configuration" };
  }
}

async function testNeon(config: string | null): Promise<{ success: boolean; message: string }> {
  // For Neon, we just check if DATABASE_URL is set since it's already configured
  if (process.env.DATABASE_URL) {
    return { success: true, message: "Database URL is configured" };
  }
  return { success: false, message: "DATABASE_URL not set" };
}

async function testTelegram(config: string | null): Promise<{ success: boolean; message: string }> {
  if (!config) return { success: false, message: "No configuration provided" };
  try {
    const { botToken } = JSON.parse(config);
    if (!botToken) return { success: false, message: "No bot token provided" };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);

    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        return { success: true, message: `Connected as @${data.result.username}` };
      }
    }
    return { success: false, message: "Invalid bot token" };
  } catch {
    return { success: false, message: "Failed to parse configuration" };
  }
}

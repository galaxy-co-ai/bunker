import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, integrations } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/integrations - List all integrations
export async function GET() {
  try {
    const allIntegrations = await db
      .select()
      .from(integrations)
      .orderBy(desc(integrations.updatedAt));

    return NextResponse.json({ integrations: allIntegrations });
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch integrations" } },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Create or update an integration
const createIntegrationSchema = z.object({
  type: z.enum(["github", "openai", "anthropic", "ollama", "vercel", "neon", "telegram"]),
  name: z.string().min(1).max(100),
  config: z.string().optional(),
  connected: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createIntegrationSchema.parse(body);

    const now = new Date();
    const newIntegration = {
      id: randomUUID(),
      type: validated.type,
      name: validated.name,
      config: validated.config ?? null,
      connected: validated.connected ?? 0,
      lastChecked: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(integrations).values(newIntegration);

    const [created] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, newIntegration.id));

    return NextResponse.json({ integration: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Failed to create integration:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create integration" } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, integrations } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/integrations/[id] - Get a single integration
export async function GET(request: NextRequest, context: RouteContext) {
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

    return NextResponse.json({ integration });
  } catch (error) {
    console.error("Failed to fetch integration:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch integration" } },
      { status: 500 }
    );
  }
}

// PATCH /api/integrations/[id] - Update an integration
const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.string().optional(),
  connected: z.number().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateIntegrationSchema.parse(body);

    const [existing] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Integration not found" } },
        { status: 404 }
      );
    }

    await db
      .update(integrations)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id));

    const [updated] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));

    return NextResponse.json({ integration: updated });
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

    console.error("Failed to update integration:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update integration" } },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/[id] - Delete an integration
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const [existing] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Integration not found" } },
        { status: 404 }
      );
    }

    await db.delete(integrations).where(eq(integrations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete integration:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete integration" } },
      { status: 500 }
    );
  }
}

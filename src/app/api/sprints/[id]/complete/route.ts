import { NextRequest, NextResponse } from "next/server";
import { db, sprints } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/sprints/[id]/complete - Mark sprint as completed
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    if (existing.status === "completed") {
      return NextResponse.json(
        { error: { code: "ALREADY_COMPLETED", message: "Sprint is already completed" } },
        { status: 400 }
      );
    }

    const now = new Date();

    await db.update(sprints)
      .set({
        status: "completed",
        completedAt: now,
      })
      .where(eq(sprints.id, id));

    const [updated] = await db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id));

    return NextResponse.json({ sprint: updated });
  } catch (error) {
    console.error("Failed to complete sprint:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to complete sprint" } },
      { status: 500 }
    );
  }
}

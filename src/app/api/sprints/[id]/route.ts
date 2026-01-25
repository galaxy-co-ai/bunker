import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, sprints, tasks } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sprints/[id] - Get a single sprint
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const sprint = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id))
      .get();

    if (!sprint) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("Failed to fetch sprint:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch sprint" } },
      { status: 500 }
    );
  }
}

// PATCH /api/sprints/[id] - Update a sprint
const updateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.number().nullable().optional(),
  endDate: z.number().nullable().optional(),
  status: z.enum(["planned", "active", "completed"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSprintSchema.parse(body);

    const existing = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) {
      updateData.name = validated.name;
    }
    if (validated.startDate !== undefined) {
      updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
    }
    if (validated.endDate !== undefined) {
      updateData.endDate = validated.endDate ? new Date(validated.endDate) : null;
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      if (validated.status === "completed") {
        updateData.completedAt = new Date();
      }
    }

    db.update(sprints)
      .set(updateData)
      .where(eq(sprints.id, id))
      .run();

    const updated = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id))
      .get();

    return NextResponse.json({ sprint: updated });
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

    console.error("Failed to update sprint:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update sprint" } },
      { status: 500 }
    );
  }
}

// DELETE /api/sprints/[id] - Delete a sprint and its tasks
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    // Delete related tasks first (cascade should handle this)
    db.delete(tasks).where(eq(tasks.sprintId, id)).run();
    db.delete(sprints).where(eq(sprints.id, id)).run();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete sprint:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete sprint" } },
      { status: 500 }
    );
  }
}

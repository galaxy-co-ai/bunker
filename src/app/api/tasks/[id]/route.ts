import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, tasks } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/tasks/[id] - Update a task
const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateTaskSchema.parse(body);

    const [existing] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (validated.title !== undefined) {
      updateData.title = validated.title;
    }
    if (validated.description !== undefined) {
      updateData.description = validated.description;
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      if (validated.status === "done" && existing.status !== "done") {
        updateData.completedAt = new Date();
      } else if (validated.status !== "done") {
        updateData.completedAt = null;
      }
    }
    if (validated.orderIndex !== undefined) {
      updateData.orderIndex = validated.orderIndex;
    }

    await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id));

    const [updated] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    return NextResponse.json({ task: updated });
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

    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update task" } },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete task" } },
      { status: 500 }
    );
  }
}

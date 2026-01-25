import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, tasks, sprints } from "@/lib/db";
import { asc, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sprints/[id]/tasks - List tasks for a sprint
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sprintId } = await params;

    // Verify sprint exists
    const sprint = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, sprintId))
      .get();

    if (!sprint) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    const sprintTasks = db
      .select()
      .from(tasks)
      .where(eq(tasks.sprintId, sprintId))
      .orderBy(asc(tasks.orderIndex))
      .all();

    return NextResponse.json({ tasks: sprintTasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch tasks" } },
      { status: 500 }
    );
  }
}

// POST /api/sprints/[id]/tasks - Create a new task
const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sprintId } = await params;
    const body = await request.json();
    const validated = createTaskSchema.parse(body);

    // Verify sprint exists
    const sprint = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, sprintId))
      .get();

    if (!sprint) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    // Get the next order index
    const maxOrderResult = db
      .select({ maxOrder: sql<number>`MAX(order_index)` })
      .from(tasks)
      .where(eq(tasks.sprintId, sprintId))
      .get();

    const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

    const now = new Date();
    const newTask = {
      id: randomUUID(),
      sprintId,
      title: validated.title,
      description: validated.description ?? null,
      status: "todo" as const,
      orderIndex: nextOrder,
      createdAt: now,
      completedAt: null,
    };

    db.insert(tasks).values(newTask).run();

    const created = db
      .select()
      .from(tasks)
      .where(eq(tasks.id, newTask.id))
      .get();

    return NextResponse.json({ task: created }, { status: 201 });
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

    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create task" } },
      { status: 500 }
    );
  }
}

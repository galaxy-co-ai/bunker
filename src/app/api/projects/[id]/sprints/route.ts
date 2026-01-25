import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, sprints, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/sprints - List sprints for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    // Verify project exists
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const projectSprints = db
      .select()
      .from(sprints)
      .where(eq(sprints.projectId, projectId))
      .orderBy(desc(sprints.createdAt))
      .all();

    return NextResponse.json({ sprints: projectSprints });
  } catch (error) {
    console.error("Failed to fetch sprints:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch sprints" } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/sprints - Create a new sprint
const createSprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const validated = createSprintSchema.parse(body);

    // Verify project exists
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const now = new Date();
    const newSprint = {
      id: randomUUID(),
      projectId,
      name: validated.name,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      status: "planned" as const,
      createdAt: now,
      completedAt: null,
    };

    db.insert(sprints).values(newSprint).run();

    const created = db
      .select()
      .from(sprints)
      .where(eq(sprints.id, newSprint.id))
      .get();

    return NextResponse.json({ sprint: created }, { status: 201 });
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

    console.error("Failed to create sprint:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create sprint" } },
      { status: 500 }
    );
  }
}

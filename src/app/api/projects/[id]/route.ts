import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, projects, sprints, documents, conversations, secrets } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch project" } },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  path: z.string().nullable().optional(),
  settings: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    const existing = db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    db.update(projects)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .run();

    const updated = db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();

    return NextResponse.json({ project: updated });
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

    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update project" } },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project and all related data
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    // Delete related data (cascading should handle this, but explicit for clarity)
    db.delete(secrets).where(eq(secrets.projectId, id)).run();
    db.delete(conversations).where(eq(conversations.projectId, id)).run();
    db.delete(documents).where(eq(documents.projectId, id)).run();
    db.delete(sprints).where(eq(sprints.projectId, id)).run();
    db.delete(projects).where(eq(projects.id, id)).run();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete project" } },
      { status: 500 }
    );
  }
}

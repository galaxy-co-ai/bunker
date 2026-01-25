import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import { buildProjectContext } from "@/lib/ai/context-builder";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/context - Get AI context for a project
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

    const context = buildProjectContext(projectId);

    return NextResponse.json({ context });
  } catch (error) {
    console.error("Failed to build context:", error);
    return NextResponse.json(
      { error: { code: "BUILD_FAILED", message: "Failed to build context" } },
      { status: 500 }
    );
  }
}

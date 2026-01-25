import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, changelog, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/changelog - List changelog entries for a project
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    // Verify project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const entries = await db
      .select()
      .from(changelog)
      .where(eq(changelog.projectId, projectId))
      .orderBy(desc(changelog.createdAt));

    return NextResponse.json({ changelog: entries, project });
  } catch (error) {
    console.error("Failed to fetch changelog:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch changelog" } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/changelog - Create a changelog entry
const createChangelogSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  type: z.enum(["sprint_complete", "deploy", "milestone", "manual"]).optional(),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json();
    const validated = createChangelogSchema.parse(body);

    // Verify project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const newEntry = {
      id: randomUUID(),
      projectId,
      title: validated.title,
      excerpt: validated.excerpt ?? null,
      content: validated.content ?? null,
      type: validated.type ?? "manual",
      imageUrl: validated.imageUrl ?? null,
      createdAt: new Date(),
    };

    await db.insert(changelog).values(newEntry);

    const [created] = await db
      .select()
      .from(changelog)
      .where(eq(changelog.id, newEntry.id));

    return NextResponse.json({ entry: created }, { status: 201 });
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

    console.error("Failed to create changelog entry:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create changelog entry" } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/projects - List all projects
export async function GET() {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return NextResponse.json({ projects: allProjects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch projects" } },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  path: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const now = new Date();
    const newProject = {
      id: randomUUID(),
      name: validated.name,
      description: validated.description ?? null,
      path: validated.path ?? null,
      createdAt: now,
      updatedAt: now,
      settings: null,
    };

    await db.insert(projects).values(newProject);

    const [created] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, newProject.id));

    return NextResponse.json({ project: created }, { status: 201 });
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

    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create project" } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createFolderSchema = z.object({
  path: z.string().min(1),
});

// POST /api/projects/[id]/files/create-folder - Create a new folder
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const result = createFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const { path: folderPath } = result.data;

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

    if (!project.path) {
      return NextResponse.json(
        { error: { code: "NO_PATH", message: "Project has no path configured" } },
        { status: 400 }
      );
    }

    // Resolve path
    const fullPath = path.join(project.path, folderPath);

    // Security: Ensure path is within project directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedProject = path.normalize(project.path);

    if (!normalizedPath.startsWith(normalizedProject)) {
      return NextResponse.json(
        { error: { code: "INVALID_PATH", message: "Path is outside project directory" } },
        { status: 400 }
      );
    }

    // Check doesn't already exist
    if (fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: { code: "ALREADY_EXISTS", message: "A folder with that name already exists" } },
        { status: 400 }
      );
    }

    // Create folder
    fs.mkdirSync(fullPath, { recursive: true });

    return NextResponse.json({
      success: true,
      path: path.relative(project.path, fullPath).replace(/\\/g, "/"),
    });
  } catch (error) {
    console.error("Failed to create folder:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create folder" } },
      { status: 500 }
    );
  }
}

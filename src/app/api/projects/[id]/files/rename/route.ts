import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const renameSchema = z.object({
  oldPath: z.string().min(1),
  newName: z.string().min(1).refine(
    (name) => !name.includes("/") && !name.includes("\\"),
    "Name cannot contain path separators"
  ),
});

// POST /api/projects/[id]/files/rename - Rename a file or folder
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const result = renameSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const { oldPath, newName } = result.data;

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

    // Resolve paths
    const fullOldPath = path.join(project.path, oldPath);
    const parentDir = path.dirname(fullOldPath);
    const fullNewPath = path.join(parentDir, newName);

    // Security: Ensure paths are within project directory
    const normalizedOld = path.normalize(fullOldPath);
    const normalizedNew = path.normalize(fullNewPath);
    const normalizedProject = path.normalize(project.path);

    if (!normalizedOld.startsWith(normalizedProject) || !normalizedNew.startsWith(normalizedProject)) {
      return NextResponse.json(
        { error: { code: "INVALID_PATH", message: "Path is outside project directory" } },
        { status: 400 }
      );
    }

    // Check source exists
    if (!fs.existsSync(fullOldPath)) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "File or folder not found" } },
        { status: 404 }
      );
    }

    // Check destination doesn't exist
    if (fs.existsSync(fullNewPath)) {
      return NextResponse.json(
        { error: { code: "ALREADY_EXISTS", message: "A file or folder with that name already exists" } },
        { status: 400 }
      );
    }

    // Rename
    fs.renameSync(fullOldPath, fullNewPath);

    return NextResponse.json({
      success: true,
      newPath: path.relative(project.path, fullNewPath).replace(/\\/g, "/"),
    });
  } catch (error) {
    console.error("Failed to rename:", error);
    return NextResponse.json(
      { error: { code: "RENAME_FAILED", message: "Failed to rename file or folder" } },
      { status: 500 }
    );
  }
}

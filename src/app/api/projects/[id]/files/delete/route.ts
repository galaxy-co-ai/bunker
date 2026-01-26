import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const deleteSchema = z.object({
  path: z.string().min(1),
});

// POST /api/projects/[id]/files/delete - Delete a file or folder
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const { path: filePath } = result.data;

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
    const fullPath = path.join(project.path, filePath);

    // Security: Ensure path is within project directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedProject = path.normalize(project.path);

    if (!normalizedPath.startsWith(normalizedProject) || normalizedPath === normalizedProject) {
      return NextResponse.json(
        { error: { code: "INVALID_PATH", message: "Cannot delete project root or paths outside project" } },
        { status: 400 }
      );
    }

    // Check exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "File or folder not found" } },
        { status: 404 }
      );
    }

    // Delete (recursively for directories)
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete file or folder" } },
      { status: 500 }
    );
  }
}

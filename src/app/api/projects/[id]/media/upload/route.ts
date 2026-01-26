import { NextRequest, NextResponse } from "next/server";
import { db, media, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

// POST /api/projects/[id]/media/upload - Upload media files
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: { code: "NO_FILES", message: "No files provided" } },
        { status: 400 }
      );
    }

    const results: Array<{
      name: string;
      mimeType: string;
      size: number;
      success: boolean;
      error?: string;
      id?: string;
    }> = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        results.push({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          success: false,
          error: `Unsupported file type: ${file.type}`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          success: false,
          error: "File too large (max 5MB)",
        });
        continue;
      }

      try {
        // Convert to base64
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        const id = randomUUID();

        await db.insert(media).values({
          id,
          projectId,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: dataUrl,
        });

        results.push({
          id,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          success: true,
        });
      } catch (error) {
        results.push({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          success: false,
          error: "Failed to save file",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Uploaded ${successCount} of ${files.length} files`,
      results,
    });
  } catch (error) {
    console.error("Media upload failed:", error);
    return NextResponse.json(
      {
        error: {
          code: "UPLOAD_FAILED",
          message: error instanceof Error ? error.message : "Failed to upload media",
        },
      },
      { status: 500 }
    );
  }
}

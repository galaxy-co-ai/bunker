import { NextRequest, NextResponse } from "next/server";
import { db, projects, documents, media } from "@/lib/db";
import { eq } from "drizzle-orm";
import JSZip from "jszip";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/export - Export project as ZIP
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    // Get project
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

    // Get documents
    const projectDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId));

    // Get media
    const projectMedia = await db
      .select()
      .from(media)
      .where(eq(media.projectId, projectId));

    // Create ZIP
    const zip = new JSZip();

    // Add project manifest
    const manifest = {
      name: project.name,
      description: project.description,
      path: project.path,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      exportedAt: new Date().toISOString(),
    };
    zip.file("project.json", JSON.stringify(manifest, null, 2));

    // Add documents
    if (projectDocuments.length > 0) {
      const docsFolder = zip.folder("documents");
      for (const doc of projectDocuments) {
        const fileName = `${doc.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.md`;
        const content = `# ${doc.name}\n\n${doc.content}`;
        docsFolder?.file(fileName, content);
      }
    }

    // Add media
    if (projectMedia.length > 0) {
      const mediaFolder = zip.folder("media");
      for (const item of projectMedia) {
        // Media data is stored as base64
        const extension = getExtensionFromMimeType(item.mimeType);
        const fileName = `${item.name.replace(/[^a-zA-Z0-9-_]/g, "_")}.${extension}`;
        const data = Buffer.from(item.data, "base64");
        mediaFolder?.file(fileName, data);
      }
    }

    // Generate ZIP as blob
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Create safe filename
    const safeProjectName = project.name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${safeProjectName}_${timestamp}.zip`;

    // Return ZIP file
    return new NextResponse(zipBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export project:", error);
    return NextResponse.json(
      { error: { code: "EXPORT_FAILED", message: "Failed to export project" } },
      { status: 500 }
    );
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/markdown": "md",
    "application/json": "json",
  };
  return mimeToExt[mimeType] || "bin";
}

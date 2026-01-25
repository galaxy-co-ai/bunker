import { NextRequest, NextResponse } from "next/server";
import { db, documents, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { PROJECT_TEMPLATES } from "@/lib/templates/project-templates";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/seed-templates - Seed project with document templates
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

    // Check if project already has documents
    const existingDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId));

    if (existingDocs.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "ALREADY_HAS_DOCS",
            message: "Project already has documents. Use force=true to override."
          }
        },
        { status: 400 }
      );
    }

    // Create documents from templates
    const now = new Date();
    const newDocs = PROJECT_TEMPLATES.map((template) => ({
      id: randomUUID(),
      projectId,
      name: template.name,
      content: template.content
        .replace(/\[Project Name\]/g, project.name)
        .replace(/\[Date\]/g, now.toISOString().split("T")[0]),
      docType: template.docType,
      folder: template.folder,
      createdAt: now,
      updatedAt: now,
    }));

    // Insert all documents
    await db.insert(documents).values(newDocs);

    // Fetch the created documents
    const createdDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId));

    return NextResponse.json(
      {
        message: `Seeded ${createdDocs.length} document templates`,
        documents: createdDocs
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to seed templates:", error);
    return NextResponse.json(
      { error: { code: "SEED_FAILED", message: "Failed to seed templates" } },
      { status: 500 }
    );
  }
}

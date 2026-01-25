import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, documents, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/documents - List documents for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

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

    const projectDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.updatedAt));

    return NextResponse.json({ documents: projectDocuments });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch documents" } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/documents - Create a new document
const createDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required").max(100),
  content: z.string(),
  docType: z.enum(["brief", "prd", "tad", "other"]).optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const validated = createDocumentSchema.parse(body);

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

    const now = new Date();
    const newDocument = {
      id: randomUUID(),
      projectId,
      name: validated.name,
      content: validated.content,
      docType: validated.docType ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(documents).values(newDocument);

    const [created] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, newDocument.id));

    return NextResponse.json({ document: created }, { status: 201 });
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

    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create document" } },
      { status: 500 }
    );
  }
}

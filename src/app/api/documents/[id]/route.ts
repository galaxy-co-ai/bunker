import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, documents } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get a single document
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const document = db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .get();

    if (!document) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch document" } },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] - Update a document
const updateDocumentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  content: z.string().optional(),
  docType: z.enum(["brief", "prd", "tad", "other"]).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateDocumentSchema.parse(body);

    const existing = db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    db.update(documents)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .run();

    const updated = db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .get();

    return NextResponse.json({ document: updated });
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

    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update document" } },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    db.delete(documents).where(eq(documents.id, id)).run();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete document" } },
      { status: 500 }
    );
  }
}

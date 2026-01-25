import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, conversations, projects } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createConversationSchema = z.object({
  title: z.string().optional(),
  modelId: z.string().optional(),
});

// GET /api/projects/[id]/conversations - List conversations for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    // Verify project exists
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const projectConversations = db
      .select()
      .from(conversations)
      .where(eq(conversations.projectId, projectId))
      .orderBy(desc(conversations.updatedAt))
      .all();

    return NextResponse.json(projectConversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch conversations" } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/conversations - Create a new conversation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

    // Verify project exists
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();

    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = createConversationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const { title, modelId } = result.data;
    const now = new Date();
    const id = crypto.randomUUID();

    db.insert(conversations)
      .values({
        id,
        projectId,
        title: title || null,
        modelId: modelId || null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const newConversation = db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .get();

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create conversation" } },
      { status: 500 }
    );
  }
}

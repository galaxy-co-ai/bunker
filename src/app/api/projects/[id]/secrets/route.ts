import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, secrets, projects } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto/secrets";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createSecretSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

// GET /api/projects/[id]/secrets - List secrets (keys only, not values)
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

    const projectSecrets = await db
      .select({
        id: secrets.id,
        key: secrets.key,
        createdAt: secrets.createdAt,
        updatedAt: secrets.updatedAt,
      })
      .from(secrets)
      .where(eq(secrets.projectId, projectId));

    return NextResponse.json(projectSecrets);
  } catch (error) {
    console.error("Failed to fetch secrets:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch secrets" } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/secrets - Create or update a secret
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const result = createSecretSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const { key, value } = result.data;
    const now = new Date();
    const encryptedValue = encrypt(value);

    // Check if secret with this key already exists
    const [existingSecret] = await db
      .select()
      .from(secrets)
      .where(and(eq(secrets.projectId, projectId), eq(secrets.key, key)));

    if (existingSecret) {
      // Update existing secret
      await db.update(secrets)
        .set({
          encryptedValue,
          updatedAt: now,
        })
        .where(eq(secrets.id, existingSecret.id));

      return NextResponse.json({
        id: existingSecret.id,
        key,
        updatedAt: now,
      });
    }

    // Create new secret
    const id = crypto.randomUUID();
    await db.insert(secrets)
      .values({
        id,
        projectId,
        key,
        encryptedValue,
        createdAt: now,
        updatedAt: now,
      });

    return NextResponse.json(
      {
        id,
        key,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create/update secret:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create/update secret" } },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/secrets?key=KEY - Delete a secret
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: { code: "MISSING_KEY", message: "Secret key is required" } },
        { status: 400 }
      );
    }

    const [existingSecret] = await db
      .select()
      .from(secrets)
      .where(and(eq(secrets.projectId, projectId), eq(secrets.key, key)));

    if (!existingSecret) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Secret not found" } },
        { status: 404 }
      );
    }

    await db.delete(secrets).where(eq(secrets.id, existingSecret.id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete secret:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: "Failed to delete secret" } },
      { status: 500 }
    );
  }
}

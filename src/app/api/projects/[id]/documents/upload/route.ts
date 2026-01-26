import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { db, documents, projects, settings, integrations } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createClaudeProvider } from "@/lib/ai/claude";
import { createOpenAIProvider } from "@/lib/ai/openai";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Schema for AI classification response
const classificationSchema = z.object({
  documents: z.array(
    z.object({
      fileName: z.string(),
      name: z.string().describe("Clean document name without extension"),
      folder: z
        .enum(["planning", "building", "shipping", "other"])
        .describe("Which folder this document belongs to"),
      docType: z
        .enum(["brief", "prd", "tad", "other"])
        .describe("Document type classification"),
    })
  ),
});

async function getAIKey(): Promise<{ provider: "anthropic" | "openai"; key: string } | null> {
  // Check settings first
  const [claudeKeySetting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "anthropic_api_key"));

  if (claudeKeySetting?.value) {
    return { provider: "anthropic", key: claudeKeySetting.value };
  }

  const [openaiKeySetting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "openai_api_key"));

  if (openaiKeySetting?.value) {
    return { provider: "openai", key: openaiKeySetting.value };
  }

  // Fallback to integrations
  const [anthropicIntegration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.type, "anthropic"));

  if (anthropicIntegration?.config) {
    try {
      const config = JSON.parse(anthropicIntegration.config);
      if (config.apiKey) {
        return { provider: "anthropic", key: config.apiKey };
      }
    } catch {
      // Ignore
    }
  }

  const [openaiIntegration] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.type, "openai"));

  if (openaiIntegration?.config) {
    try {
      const config = JSON.parse(openaiIntegration.config);
      if (config.apiKey) {
        return { provider: "openai", key: config.apiKey };
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

// POST /api/projects/[id]/documents/upload - Upload and AI-organize documents
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

    // Get AI key
    const aiKey = await getAIKey();
    if (!aiKey) {
      return NextResponse.json(
        {
          error: {
            code: "NO_API_KEY",
            message: "No AI API key configured. Please add your API key in Settings or Connectors.",
          },
        },
        { status: 400 }
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

    // Read file contents
    const fileData: { fileName: string; content: string }[] = [];
    for (const file of files) {
      const content = await file.text();
      fileData.push({
        fileName: file.name,
        content: content.slice(0, 2000), // Limit for AI context
      });
    }

    // Create AI provider
    const provider =
      aiKey.provider === "anthropic"
        ? createClaudeProvider(aiKey.key)
        : createOpenAIProvider(aiKey.key);

    const modelId =
      aiKey.provider === "anthropic" ? "claude-3-5-haiku-20241022" : "gpt-4o-mini";

    // Classify documents with AI
    const { object: classification } = await generateObject({
      model: provider(modelId),
      schema: classificationSchema,
      prompt: `You are organizing project documents for a software project called "${project.name}".

Analyze these uploaded files and classify each one into the appropriate folder and document type.

**Folders:**
- **planning**: Documents created before building (briefs, PRDs, specs, architecture, requirements)
- **building**: Documents used during development (status updates, decision logs, test plans)
- **shipping**: Documents for deployment/release (ship checklists, release notes, deployment guides)
- **other**: Documents that don't fit the above

**Document Types:**
- **brief**: Project briefs, overviews, problem statements
- **prd**: Product requirements, feature specs, user stories
- **tad**: Technical architecture, system design, API specs
- **other**: Everything else

For each file, provide a clean human-readable name (e.g., "project-brief.md" → "Project Brief").

Files to classify:
${fileData.map((f, i) => `--- ${f.fileName} ---\n${f.content}\n---`).join("\n\n")}

Classify all ${fileData.length} files.`,
    });

    // Save documents to database
    const results: Array<{
      name: string;
      folder: string;
      docType: string;
      success: boolean;
      error?: string;
    }> = [];

    const now = new Date();

    for (const classified of classification.documents) {
      const originalFile = files.find((f) => f.name === classified.fileName);
      if (!originalFile) continue;

      try {
        // Read full content (not truncated)
        const fullContent = await originalFile.text();

        // Check for duplicates
        const existingDocs = await db
          .select()
          .from(documents)
          .where(eq(documents.projectId, projectId));

        const nameExists = existingDocs.some(
          (d) => d.name.toLowerCase() === classified.name.toLowerCase()
        );

        if (nameExists) {
          results.push({
            name: classified.name,
            folder: classified.folder,
            docType: classified.docType,
            success: false,
            error: "Document with this name already exists",
          });
          continue;
        }

        const docId = randomUUID();
        const folder = classified.folder === "other" ? null : classified.folder;

        await db.insert(documents).values({
          id: docId,
          projectId,
          name: classified.name,
          content: fullContent,
          docType: classified.docType,
          folder,
          createdAt: now,
          updatedAt: now,
        });

        results.push({
          name: classified.name,
          folder: classified.folder,
          docType: classified.docType,
          success: true,
        });
      } catch (error) {
        results.push({
          name: classified.name,
          folder: classified.folder,
          docType: classified.docType,
          success: false,
          error: "Failed to save document",
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} documents`,
      results,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        error: {
          code: "UPLOAD_FAILED",
          message: error instanceof Error ? error.message : "Failed to upload documents",
        },
      },
      { status: 500 }
    );
  }
}

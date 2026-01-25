import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { db, documents, projects, settings, integrations } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { createClaudeProvider } from "@/lib/ai/claude";
import { createOpenAIProvider } from "@/lib/ai/openai";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// File extensions to scan for documents
const DOC_EXTENSIONS = [".md", ".mdx", ".txt", ".markdown"];

// Directories to ignore
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  "coverage",
  "__pycache__",
  "venv",
  ".venv",
];

// Schema for AI classification response
const classificationSchema = z.object({
  documents: z.array(
    z.object({
      filePath: z.string(),
      name: z.string().describe("Clean document name without path or extension"),
      folder: z
        .enum(["planning", "building", "shipping", "other"])
        .describe("Which folder this document belongs to"),
      docType: z
        .enum(["brief", "prd", "tad", "other"])
        .describe("Document type classification"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("Confidence score for this classification"),
      reasoning: z.string().describe("Brief explanation for the classification"),
    })
  ),
});

// Find all document files in a directory recursively
function findDocumentFiles(
  dirPath: string,
  basePath: string,
  files: { path: string; relativePath: string }[] = [],
  depth: number = 0
): { path: string; relativePath: string }[] {
  if (depth > 5) return files; // Max depth limit

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.includes(entry.name) && !entry.name.startsWith(".")) {
          findDocumentFiles(fullPath, basePath, files, depth + 1);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (DOC_EXTENSIONS.includes(ext)) {
          files.push({
            path: fullPath,
            relativePath: path.relative(basePath, fullPath).replace(/\\/g, "/"),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

// Read file content with size limit
function readFileContent(filePath: string, maxChars: number = 2000): string {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.slice(0, maxChars);
  } catch {
    return "";
  }
}

// POST /api/projects/[id]/auto-organize - AI-powered document organization
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

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

    if (!project.path) {
      return NextResponse.json(
        { error: { code: "NO_PATH", message: "Project has no path configured" } },
        { status: 400 }
      );
    }

    if (!fs.existsSync(project.path)) {
      return NextResponse.json(
        { error: { code: "PATH_NOT_FOUND", message: "Project path does not exist" } },
        { status: 400 }
      );
    }

    // Get API key (prefer Claude, fall back to OpenAI)
    // First check settings table
    const [claudeKeySetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "anthropic_api_key"));

    const [openaiKeySetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "openai_api_key"));

    let claudeKey = claudeKeySetting?.value || null;
    let openaiKey = openaiKeySetting?.value || null;

    // Fallback to integrations table (connectors)
    if (!claudeKey) {
      const [anthropicIntegration] = await db
        .select()
        .from(integrations)
        .where(eq(integrations.type, "anthropic"));

      if (anthropicIntegration?.config) {
        try {
          const config = JSON.parse(anthropicIntegration.config);
          claudeKey = config.apiKey || null;
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (!openaiKey) {
      const [openaiIntegration] = await db
        .select()
        .from(integrations)
        .where(eq(integrations.type, "openai"));

      if (openaiIntegration?.config) {
        try {
          const config = JSON.parse(openaiIntegration.config);
          openaiKey = config.apiKey || null;
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (!claudeKey && !openaiKey) {
      return NextResponse.json(
        {
          error: {
            code: "NO_API_KEY",
            message: "No AI API key configured. Please add your Anthropic or OpenAI API key in Settings or Connectors.",
          },
        },
        { status: 400 }
      );
    }

    // Find all document files
    const docFiles = findDocumentFiles(project.path, project.path);

    if (docFiles.length === 0) {
      return NextResponse.json(
        { error: { code: "NO_DOCS", message: "No document files found in project" } },
        { status: 400 }
      );
    }

    // Limit to prevent token overflow
    const maxFiles = 50;
    const filesToProcess = docFiles.slice(0, maxFiles);

    // Build file summaries for AI
    const fileSummaries = filesToProcess.map((file) => {
      const content = readFileContent(file.path, 1500);
      const fileName = path.basename(file.path);
      return {
        path: file.relativePath,
        fileName,
        preview: content,
      };
    });

    // Create AI provider
    const provider = claudeKey
      ? createClaudeProvider(claudeKey)
      : createOpenAIProvider(openaiKey!);

    const modelId = claudeKey ? "claude-3-5-haiku-20241022" : "gpt-4o-mini";

    // Call AI for classification
    const { object: classification } = await generateObject({
      model: provider(modelId),
      schema: classificationSchema,
      prompt: `You are organizing project documents for a software project management tool called Bunker.

Analyze these document files and classify each one into the appropriate folder and document type.

**Folders:**
- **planning**: Documents created before building starts (project briefs, PRDs, technical specs, architecture docs, requirements, agent specs, task sequences, audit checklists)
- **building**: Documents used during active development (project pulse/status, decision logs, test plans, changelogs, sprint docs)
- **shipping**: Documents for deployment and release (ship checklists, release notes, deployment guides, launch docs)
- **other**: Documents that don't fit the above categories

**Document Types:**
- **brief**: Project briefs, overviews, problem statements
- **prd**: Product requirements, feature specs, user stories
- **tad**: Technical architecture, system design, API specs
- **other**: Everything else

For each file, provide:
1. A clean human-readable name (convert file names like "01-project-brief.md" to "Project Brief")
2. The appropriate folder
3. The document type
4. Your confidence (0-1)
5. Brief reasoning

Project: ${project.name}
Files to classify:

${fileSummaries
  .map(
    (f, i) => `--- File ${i + 1}: ${f.path} ---
${f.preview}
---`
  )
  .join("\n\n")}

Classify all ${fileSummaries.length} files.`,
    });

    // Import documents into database
    const now = new Date();
    const importedDocs: Array<{
      id: string;
      name: string;
      folder: string;
      docType: string;
      sourcePath: string;
    }> = [];

    for (const doc of classification.documents) {
      // Find the matching file
      const fileInfo = filesToProcess.find(
        (f) => f.relativePath === doc.filePath
      );
      if (!fileInfo) continue;

      // Read full content
      const fullContent = fs.readFileSync(fileInfo.path, "utf-8");

      // Check if document with same name already exists
      const existingDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.projectId, projectId));

      const nameExists = existingDocs.some(
        (d) => d.name.toLowerCase() === doc.name.toLowerCase()
      );

      if (nameExists) {
        continue; // Skip duplicates
      }

      const docId = randomUUID();
      const folder = doc.folder === "other" ? null : doc.folder;

      await db.insert(documents).values({
        id: docId,
        projectId,
        name: doc.name,
        content: fullContent,
        docType: doc.docType,
        folder,
        createdAt: now,
        updatedAt: now,
      });

      importedDocs.push({
        id: docId,
        name: doc.name,
        folder: doc.folder,
        docType: doc.docType,
        sourcePath: doc.filePath,
      });
    }

    return NextResponse.json({
      message: `Successfully organized ${importedDocs.length} documents`,
      organized: importedDocs,
      classification: classification.documents.map((d) => ({
        path: d.filePath,
        name: d.name,
        folder: d.folder,
        docType: d.docType,
        confidence: d.confidence,
        reasoning: d.reasoning,
      })),
      skipped: docFiles.length > maxFiles ? docFiles.length - maxFiles : 0,
    });
  } catch (error) {
    console.error("Auto-organize failed:", error);
    return NextResponse.json(
      {
        error: {
          code: "ORGANIZE_FAILED",
          message: error instanceof Error ? error.message : "Failed to auto-organize documents",
        },
      },
      { status: 500 }
    );
  }
}

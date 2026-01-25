import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

// Common patterns to ignore
const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  ".vercel",
  "dist",
  "build",
  ".cache",
  ".DS_Store",
  "Thumbs.db",
  ".env",
  ".env.local",
  ".env.*.local",
  "*.log",
  "coverage",
  ".nyc_output",
  ".idea",
  ".vscode",
  "__pycache__",
  "*.pyc",
  ".pytest_cache",
  "venv",
  ".venv",
];

function shouldIgnore(name: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => {
    if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      return regex.test(name);
    }
    return name === pattern;
  });
}

function buildFileTree(
  dirPath: string,
  basePath: string,
  maxDepth: number = 5,
  currentDepth: number = 0
): FileNode[] {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      if (shouldIgnore(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: relativePath.replace(/\\/g, "/"),
          type: "directory",
          children: buildFileTree(fullPath, basePath, maxDepth, currentDepth + 1),
        });
      } else if (entry.isFile()) {
        nodes.push({
          name: entry.name,
          path: relativePath.replace(/\\/g, "/"),
          type: "file",
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return nodes;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

// GET /api/projects/[id]/files - Get file tree for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;

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

    // Check if path exists
    if (!fs.existsSync(project.path)) {
      return NextResponse.json(
        { error: { code: "PATH_NOT_FOUND", message: "Project path does not exist" } },
        { status: 400 }
      );
    }

    // Check if path is a directory
    const stats = fs.statSync(project.path);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: { code: "NOT_DIRECTORY", message: "Project path is not a directory" } },
        { status: 400 }
      );
    }

    const tree: FileNode = {
      name: path.basename(project.path),
      path: "",
      type: "directory",
      children: buildFileTree(project.path, project.path),
    };

    return NextResponse.json({ tree });
  } catch (error) {
    console.error("Failed to fetch file tree:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch file tree" } },
      { status: 500 }
    );
  }
}

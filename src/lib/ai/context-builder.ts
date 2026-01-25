import { db, projects, sprints, tasks, documents } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export interface ContextOptions {
  projectId: string;
  includeDocuments?: boolean;
  includeActiveSprint?: boolean;
  maxDocuments?: number;
}

export interface ProjectContext {
  project: {
    name: string;
    description: string | null;
    path: string | null;
  };
  activeSprint?: {
    name: string;
    status: string;
    tasks: Array<{
      title: string;
      status: string;
    }>;
  };
  documents: Array<{
    name: string;
    docType: string | null;
    content: string;
  }>;
}

// Build context string for AI from project data
export function buildContextString(context: ProjectContext): string {
  const parts: string[] = [];

  // Project info
  parts.push(`# Project: ${context.project.name}`);
  if (context.project.description) {
    parts.push(`\nDescription: ${context.project.description}`);
  }
  if (context.project.path) {
    parts.push(`\nProject Path: ${context.project.path}`);
  }

  // Active sprint info
  if (context.activeSprint) {
    parts.push(`\n\n## Current Sprint: ${context.activeSprint.name}`);
    parts.push(`Status: ${context.activeSprint.status}`);

    if (context.activeSprint.tasks.length > 0) {
      parts.push("\n### Tasks:");
      for (const task of context.activeSprint.tasks) {
        const statusIcon =
          task.status === "done" ? "[x]" : task.status === "in_progress" ? "[~]" : "[ ]";
        parts.push(`- ${statusIcon} ${task.title}`);
      }
    }
  }

  // Documents
  if (context.documents.length > 0) {
    parts.push("\n\n## Project Documents");
    for (const doc of context.documents) {
      parts.push(`\n### ${doc.name}${doc.docType ? ` (${doc.docType})` : ""}`);
      parts.push(doc.content);
    }
  }

  return parts.join("\n");
}

// Get project context from database
export function getProjectContext(options: ContextOptions): ProjectContext | null {
  const { projectId, includeDocuments = true, includeActiveSprint = true, maxDocuments = 5 } =
    options;

  // Get project
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();

  if (!project) {
    return null;
  }

  const context: ProjectContext = {
    project: {
      name: project.name,
      description: project.description,
      path: project.path,
    },
    documents: [],
  };

  // Get active sprint
  if (includeActiveSprint) {
    const activeSprint = db
      .select()
      .from(sprints)
      .where(eq(sprints.projectId, projectId))
      .orderBy(desc(sprints.createdAt))
      .get();

    if (activeSprint && activeSprint.status === "active") {
      const sprintTasks = db
        .select()
        .from(tasks)
        .where(eq(tasks.sprintId, activeSprint.id))
        .all();

      context.activeSprint = {
        name: activeSprint.name,
        status: activeSprint.status,
        tasks: sprintTasks.map((t) => ({
          title: t.title,
          status: t.status,
        })),
      };
    }
  }

  // Get documents
  if (includeDocuments) {
    const projectDocs = db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.updatedAt))
      .limit(maxDocuments)
      .all();

    context.documents = projectDocs.map((doc) => ({
      name: doc.name,
      docType: doc.docType,
      content: doc.content,
    }));
  }

  return context;
}

// Main function to build context for a project
export function buildProjectContext(projectId: string): string | null {
  const context = getProjectContext({
    projectId,
    includeDocuments: true,
    includeActiveSprint: true,
  });

  if (!context) {
    return null;
  }

  return buildContextString(context);
}

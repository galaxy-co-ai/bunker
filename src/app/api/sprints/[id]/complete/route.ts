import { NextRequest, NextResponse } from "next/server";
import { db, sprints, changelog, tasks } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/sprints/[id]/complete - Mark sprint as completed
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Sprint not found" } },
        { status: 404 }
      );
    }

    if (existing.status === "completed") {
      return NextResponse.json(
        { error: { code: "ALREADY_COMPLETED", message: "Sprint is already completed" } },
        { status: 400 }
      );
    }

    const now = new Date();

    await db.update(sprints)
      .set({
        status: "completed",
        completedAt: now,
      })
      .where(eq(sprints.id, id));

    const [updated] = await db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id));

    // Auto-create changelog entry for sprint completion
    const sprintTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.sprintId, id));

    const completedTasks = sprintTasks.filter((t) => t.status === "done").length;
    const totalTasks = sprintTasks.length;

    const changelogEntry = {
      id: randomUUID(),
      projectId: existing.projectId,
      title: `Sprint Completed: ${existing.name}`,
      excerpt: `Finished ${completedTasks} of ${totalTasks} tasks.`,
      content: `<p>Sprint <strong>${existing.name}</strong> has been marked as complete.</p>
<ul>
  <li>Total tasks: ${totalTasks}</li>
  <li>Completed: ${completedTasks}</li>
  <li>Completion rate: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</li>
</ul>`,
      type: "sprint_complete",
      imageUrl: null,
      createdAt: now,
    };

    await db.insert(changelog).values(changelogEntry);

    return NextResponse.json({ sprint: updated, changelog: changelogEntry });
  } catch (error) {
    console.error("Failed to complete sprint:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to complete sprint" } },
      { status: 500 }
    );
  }
}

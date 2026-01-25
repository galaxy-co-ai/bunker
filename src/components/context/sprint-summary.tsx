"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useSprints } from "@/hooks/use-sprints";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sprint } from "@/lib/db/schema";

interface SprintSummaryProps {
  projectId: string | null;
}

function SprintCard({ sprint }: { sprint: Sprint }) {
  const { data: tasks } = useTasks(sprint.id);
  const completedTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  const getStatusIcon = () => {
    switch (sprint.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="font-medium text-sm">{sprint.name}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completedTasks}/{totalTasks} tasks
        </span>
        <span className="capitalize">{sprint.status}</span>
      </div>
      {totalTasks > 0 && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function SprintSummary({ projectId }: SprintSummaryProps) {
  const { data: sprints, isLoading, error } = useSprints(projectId);

  if (!projectId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a project to view sprints
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">Failed to load sprints</div>
    );
  }

  if (!sprints || sprints.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No sprints in this project
      </div>
    );
  }

  // Show active sprint first, then planned, then completed
  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { active: 0, planned: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-2">
      {sortedSprints.map((sprint) => (
        <SprintCard key={sprint.id} sprint={sprint} />
      ))}
    </div>
  );
}

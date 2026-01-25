"use client";

import Link from "next/link";
import { Calendar, CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useSprints } from "@/hooks/use-sprints";
import { useTasks } from "@/hooks/use-tasks";
import type { Sprint } from "@/lib/db/schema";

interface RoadmapViewProps {
  projectId: string;
}

function SprintProgress({ sprint }: { sprint: Sprint }) {
  const { data: tasks } = useTasks(sprint.id);
  const completedTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {completedTasks} / {totalTasks} tasks
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            sprint.status === "completed" ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "active":
      return <Clock className="h-5 w-5 text-blue-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "border-green-500/50 bg-green-500/5";
    case "active":
      return "border-blue-500/50 bg-blue-500/5";
    default:
      return "border-border";
  }
}

export function RoadmapView({ projectId }: RoadmapViewProps) {
  const { data: sprints, isLoading, error } = useSprints(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Calendar}
        title="Failed to load roadmap"
        description="There was an error loading the project sprints."
      />
    );
  }

  const completedSprints = sprints?.filter((s) => s.status === "completed").length ?? 0;
  const totalSprints = sprints?.length ?? 0;
  const overallProgress = totalSprints > 0 ? (completedSprints / totalSprints) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completedSprints} / {totalSprints} sprints completed
              </span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprints Timeline */}
      {!sprints || sprints.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No sprints yet"
          description="Create your first sprint to start tracking progress."
          action={
            <Link href={`/projects/${projectId}/sprints`}>
              <Button>
                Go to Sprints
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium">Sprints</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sprints.map((sprint, index) => (
              <Link
                key={sprint.id}
                href={`/projects/${projectId}/sprints`}
                className="block"
              >
                <Card
                  className={cn(
                    "h-full transition-colors hover:border-primary/50",
                    getStatusColor(sprint.status)
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sprint.status)}
                        <CardTitle className="text-base">
                          {sprint.name}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SprintProgress sprint={sprint} />
                    <p className="mt-3 text-xs capitalize text-muted-foreground">
                      {sprint.status}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

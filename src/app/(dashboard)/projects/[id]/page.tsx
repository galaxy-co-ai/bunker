"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { RoadmapView } from "@/components/roadmap/roadmap-view";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setActiveProjectId } = useProjectStore();
  const { data: project, isLoading, error } = useProject(projectId);

  // Sync active project with URL
  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
    }
  }, [projectId, setActiveProjectId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <p className="mt-2 text-muted-foreground">
            The project you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-muted-foreground">{project.description}</p>
            )}
            {project.path && (
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                {project.path}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/sprints`}>
              <Button variant="outline" size="sm">
                Sprints
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <EditProjectDialog
              project={project}
              trigger={
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <DeleteProjectDialog
              project={project}
              trigger={
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
            />
          </div>
        </div>

        {/* Roadmap */}
        <div className="mt-8">
          <RoadmapView projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

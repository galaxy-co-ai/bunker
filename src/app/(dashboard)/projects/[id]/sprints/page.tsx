"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { SprintList } from "@/components/sprints/sprint-list";
import { SprintDetail } from "@/components/sprints/sprint-detail";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sprint } from "@/lib/db/schema";

export default function SprintsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setActiveProjectId } = useProjectStore();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // Sync active project with URL
  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
    }
  }, [projectId, setActiveProjectId]);

  if (projectLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-border p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={Calendar}
          title="Project not found"
          description="The project you're looking for doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sprint List Sidebar */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-border p-6">
        <SprintList
          projectId={projectId}
          selectedSprintId={selectedSprint?.id}
          onSelectSprint={setSelectedSprint}
        />
      </div>

      {/* Sprint Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSprint ? (
          <SprintDetail
            sprint={selectedSprint}
            onSprintCompleted={() => setSelectedSprint(null)}
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title="No sprint selected"
            description="Select a sprint from the list to view its details and tasks."
          />
        )}
      </div>
    </div>
  );
}

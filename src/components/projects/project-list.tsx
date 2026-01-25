"use client";

import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListProps {
  collapsed?: boolean;
}

export function ProjectList({ collapsed = false }: ProjectListProps) {
  const router = useRouter();
  const { data: projects, isLoading, error } = useProjects();
  const { activeProjectId, setActiveProjectId } = useProjectStore();

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-2">
            <Skeleton className="h-4 w-4" />
            {!collapsed && <Skeleton className="h-4 flex-1" />}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-2 text-sm text-destructive">
        Failed to load projects
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
        <FolderKanban className="h-4 w-4" />
        {!collapsed && <span>No projects yet</span>}
      </div>
    );
  }

  return (
    <nav className="space-y-1">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => handleProjectClick(project.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            activeProjectId === project.id &&
              "bg-accent text-accent-foreground font-medium"
          )}
        >
          <FolderKanban className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="truncate">{project.name}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

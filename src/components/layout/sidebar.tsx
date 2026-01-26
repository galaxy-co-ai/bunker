"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderKanban,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjects } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { ProjectFilesSync } from "@/components/projects/project-files-sync";
import { ProjectNewMenu } from "@/components/projects/project-new-menu";
import { ProjectSettings } from "@/components/projects/project-settings";
import { ConnectorsPanel } from "@/components/connectors/connectors-panel";
import { FileTree } from "@/components/context/file-tree";
import { Skeleton } from "@/components/ui/skeleton";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: projects, isLoading } = useProjects();
  const { activeProjectId, setActiveProjectId } = useProjectStore();
  const [projectsExpanded, setProjectsExpanded] = useState(false);

  // Clear stale activeProjectId if it's not in the projects list
  useEffect(() => {
    if (!isLoading && projects && activeProjectId) {
      const projectExists = projects.some((p) => p.id === activeProjectId);
      if (!projectExists) {
        setActiveProjectId(null);
      }
    }
  }, [projects, isLoading, activeProjectId, setActiveProjectId]);

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    router.push(`/projects/${projectId}`);
    setProjectsExpanded(false);
  };

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <Link href="/" className="flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Bunker</span>
          </Link>
        )}
        {!sidebarOpen && (
          <Link href="/" className="mx-auto">
            <Box className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      <Separator />

      {/* Active Project Info */}
      {activeProjectId && projects && (
        <>
          {(() => {
            const activeProject = projects.find((p) => p.id === activeProjectId);
            if (!activeProject) return null;
            return (
              <>
                <div className="p-4 pb-1">
                  {sidebarOpen ? (
                    <div className="text-center" title={activeProject.path || undefined}>
                      <h2 className="font-semibold text-lg truncate cursor-default">
                        {activeProject.name}
                      </h2>
                    </div>
                  ) : (
                    <div className="flex justify-center" title={activeProject.path || undefined}>
                      <FolderKanban className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                {/* Action Tab Bar: minimal icons */}
                <div className={cn(
                  "pb-2",
                  sidebarOpen ? "px-4 flex justify-center" : "flex flex-col items-center gap-0.5"
                )}>
                  {sidebarOpen ? (
                    <div className="inline-flex items-center rounded border border-border/50 bg-muted/30 p-px">
                      <ProjectNewMenu
                        projectId={activeProject.id}
                        collapsed={true}
                      />
                      <ProjectFilesSync
                        projectId={activeProject.id}
                        projectPath={activeProject.path}
                        collapsed={true}
                      />
                      <ProjectSettings
                        projectId={activeProject.id}
                        projectName={activeProject.name}
                        projectPath={activeProject.path}
                        collapsed={true}
                      />
                    </div>
                  ) : (
                    <>
                      <ProjectNewMenu
                        projectId={activeProject.id}
                        collapsed={true}
                      />
                      <ProjectFilesSync
                        projectId={activeProject.id}
                        projectPath={activeProject.path}
                        collapsed={true}
                      />
                      <ProjectSettings
                        projectId={activeProject.id}
                        projectName={activeProject.name}
                        projectPath={activeProject.path}
                        collapsed={true}
                      />
                    </>
                  )}
                </div>

                {/* File Tree - shows directly when path exists and has files */}
                {sidebarOpen && activeProject.path && (
                  <div className="px-4 pt-2 max-h-48 overflow-y-auto">
                    <FileTree projectId={activeProject.id} />
                  </div>
                )}
              </>
            );
          })()}
          <Separator />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      <Separator />

      {/* Projects Accordion */}
      <div className="p-3 pb-0">
        {/* Expanded Content - renders above the button */}
        {projectsExpanded && sidebarOpen && (
          <div className="mb-2 rounded-lg border border-border bg-background/50 overflow-hidden">
            {/* New Project Option */}
            <NewProjectDialog
              trigger={
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border">
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </button>
              }
            />

            {/* Project List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No projects yet
                </div>
              ) : (
                <div className="py-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                        "hover:bg-accent",
                        activeProjectId === project.id && "bg-accent font-medium"
                      )}
                    >
                      <FolderKanban className="h-4 w-4 shrink-0" />
                      <span className="truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Toggle Button */}
        <Button
          variant="ghost"
          onClick={() => sidebarOpen && setProjectsExpanded(!projectsExpanded)}
          className={cn(
            "w-full justify-start gap-2",
            !sidebarOpen && "px-0 justify-center",
            projectsExpanded && "bg-accent"
          )}
        >
          <FolderKanban className="h-4 w-4" />
          {sidebarOpen && (
            <>
              <span>Projects</span>
              <ChevronUp
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  !projectsExpanded && "rotate-180"
                )}
              />
            </>
          )}
        </Button>
      </div>

      {/* Connectors Button */}
      <div className="p-3 pb-0">
        <ConnectorsPanel collapsed={!sidebarOpen} />
      </div>

      {/* Settings Link */}
      <div className="p-3">
        <Link href="/settings">
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              !sidebarOpen && "px-0 justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {sidebarOpen && <span>Settings</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

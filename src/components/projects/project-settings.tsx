"use client";

import { useState } from "react";
import { Settings, Box, Layers, Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectSettingsProps {
  projectId: string;
  projectName: string;
  projectPath: string | null;
  collapsed?: boolean;
}

interface ProjectStats {
  techStack: string[];
  projectSize: string;
  moduleCount: number;
  healthStatus: "healthy" | "warning" | "critical";
  alerts: Array<{
    type: "bug" | "warning" | "info";
    message: string;
  }>;
}

async function fetchProjectStats(projectId: string): Promise<ProjectStats> {
  // For now, return mock data - this can be wired to a real API later
  const response = await fetch(`/api/projects/${projectId}/files`);

  let fileCount = 0;
  if (response.ok) {
    const data = await response.json();
    fileCount = countFiles(data.tree);
  }

  return {
    techStack: ["Next.js", "TypeScript", "Tailwind"],
    projectSize: fileCount > 0 ? `${fileCount} files` : "Not synced",
    moduleCount: Math.max(1, Math.floor(fileCount / 10)),
    healthStatus: fileCount > 0 ? "healthy" : "warning",
    alerts: fileCount === 0
      ? [{ type: "info", message: "Sync project to analyze" }]
      : [],
  };
}

function countFiles(tree: { type: string; children?: unknown[] } | null): number {
  if (!tree) return 0;
  if (tree.type === "file") return 1;
  let count = 0;
  for (const child of (tree.children || []) as { type: string; children?: unknown[] }[]) {
    count += countFiles(child);
  }
  return count;
}

export function ProjectSettings({ projectId, projectName, projectPath, collapsed }: ProjectSettingsProps) {
  const [open, setOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: () => fetchProjectStats(projectId),
    enabled: open,
  });

  const triggerButton = (
    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
      <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" strokeWidth={1.5} />
            {projectName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : stats ? (
          <div className="space-y-4 py-2">
            {/* Tech Stack */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Layers className="h-4 w-4" strokeWidth={1.5} />
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold">{stats.projectSize.split(" ")[0]}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.projectSize.includes("files") ? "Files" : stats.projectSize}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{stats.moduleCount}</div>
                <div className="text-xs text-muted-foreground">Modules</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  {stats.healthStatus === "healthy" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
                  ) : stats.healthStatus === "warning" ? (
                    <AlertTriangle className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{stats.healthStatus}</div>
              </div>
            </div>

            {/* Alerts */}
            {stats.alerts.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Activity className="h-4 w-4" strokeWidth={1.5} />
                    Alerts
                  </div>
                  <div className="space-y-1.5">
                    {stats.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
                      >
                        {alert.type === "bug" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                        ) : alert.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" strokeWidth={1.5} />
                        )}
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Path */}
            {projectPath && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Path</div>
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs font-mono truncate">
                    {projectPath}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

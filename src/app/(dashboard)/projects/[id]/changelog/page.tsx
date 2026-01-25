"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GitPullRequest, Plus, Maximize2, Calendar } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Changelog } from "@/lib/db/schema";

const typeLabels: Record<string, string> = {
  sprint_complete: "Sprint Complete",
  deploy: "Deployment",
  milestone: "Milestone",
  manual: "Update",
};

const typeColors: Record<string, string> = {
  sprint_complete: "bg-green-500/10 text-green-600 dark:text-green-400",
  deploy: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  milestone: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  manual: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function ChangelogPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { setActiveProjectId } = useProjectStore();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const [entries, setEntries] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
      fetchChangelog();
    }
  }, [projectId, setActiveProjectId]);

  async function fetchChangelog() {
    try {
      const response = await fetch(`/api/projects/${projectId}/changelog`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.changelog || []);
      }
    } catch (error) {
      console.error("Failed to fetch changelog:", error);
    } finally {
      setLoading(false);
    }
  }

  if (projectLoading || loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
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
    <div className="container max-w-4xl py-8">
      <div className="border-b border-border pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitPullRequest className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
              <p className="text-sm text-muted-foreground">
                History of updates for {project.name}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No changelog entries"
          description="Entries are automatically created when sprints are completed, deploys happen, or milestones are reached."
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {entries.map((entry) => (
              <Dialog key={entry.id}>
                <div className="relative flex flex-col md:flex-row gap-4 md:gap-8">
                  {/* Date */}
                  <div className="md:w-28 shrink-0 md:text-right">
                    <time className="text-sm font-medium text-muted-foreground">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Unknown date"}
                    </time>
                    {entry.type && (
                      <span
                        className={cn(
                          "block mt-1 text-xs px-2 py-0.5 rounded-full w-fit md:ml-auto",
                          typeColors[entry.type] || typeColors.manual
                        )}
                      >
                        {typeLabels[entry.type] || entry.type}
                      </span>
                    )}
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-[7.5rem] top-1 w-2 h-2 rounded-full bg-primary -translate-x-1/2" />

                  {/* Content */}
                  <div className="flex-1 md:pl-8">
                    <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>

                    {entry.imageUrl && (
                      <DialogTrigger asChild>
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          className="w-full max-h-64 object-cover rounded-lg border border-border mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </DialogTrigger>
                    )}

                    {entry.excerpt && (
                      <p className="text-muted-foreground text-sm mb-3">
                        {entry.excerpt}
                      </p>
                    )}

                    {entry.content && (
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Maximize2 className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                    )}
                  </div>
                </div>

                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{entry.title}</DialogTitle>
                    <DialogDescription>{entry.excerpt}</DialogDescription>
                  </DialogHeader>
                  {entry.imageUrl && (
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="w-full max-h-80 object-cover rounded-lg border border-border"
                    />
                  )}
                  {entry.content && (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

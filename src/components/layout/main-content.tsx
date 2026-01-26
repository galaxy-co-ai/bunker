"use client";

import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { data: projects } = useProjects();
  const { activeProjectId } = useProjectStore();
  const activeProject = projects?.find((p) => p.id === activeProjectId);

  return (
    <main
      className={cn(
        "relative flex-1 overflow-y-auto bg-background",
        className
      )}
    >
      {/* Background Pattern - Grid with radial vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,_var(--muted)_1px,_transparent_1px),linear-gradient(to_bottom,_var(--muted)_1px,_transparent_1px)] bg-[length:40px_40px] dark:opacity-100 opacity-50"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
        }}
      />
      <div className="relative z-10 h-full w-full flex flex-col">
        {/* Project Title Header */}
        {activeProject && (
          <div className="flex h-14 items-center justify-center border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <h1
              className="font-semibold text-xl truncate px-4 cursor-default"
              title={activeProject.path || undefined}
            >
              {activeProject.name}
            </h1>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Target,
  ListTodo,
  Map,
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  Folder,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useSprints } from "@/hooks/use-sprints";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sprint, Task } from "@/lib/db/schema";
import { PanelChat } from "@/components/chat/panel-chat";

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;

type TabType = "task" | "sprint" | "map";

export function ContextPanel() {
  const { contextPanelOpen, toggleContextPanel, contextPanelWidth, setContextPanelWidth } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("task");
  const [chatExpanded, setChatExpanded] = useState(true);
  const panelRef = useRef<HTMLElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setContextPanelWidth(newWidth);
      }
    },
    [isResizing, setContextPanelWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <>
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-0 top-4 h-6 w-6 rounded-l-full border border-r-0 border-border bg-background shadow-sm z-20 translate-x-0"
        style={{ right: contextPanelOpen ? `${contextPanelWidth - 2}px` : "0px" }}
        onClick={toggleContextPanel}
      >
        {contextPanelOpen ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <aside
        ref={panelRef}
        className={cn(
          "relative flex h-full flex-col border-l border-border bg-card",
          !contextPanelOpen && "w-0 overflow-hidden",
          !isResizing && "transition-all duration-300"
        )}
        style={{ width: contextPanelOpen ? contextPanelWidth : 0 }}
      >
        {/* Resize Handle */}
        {contextPanelOpen && (
          <div
            onMouseDown={startResizing}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group",
              "hover:bg-primary/20 active:bg-primary/30",
              isResizing && "bg-primary/30"
            )}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {contextPanelOpen && (
          <>
            {/* Header */}
            <div className="flex h-14 items-center justify-center px-4">
              <h2 className="font-semibold text-lg">Context HQ</h2>
            </div>

            <Separator />

            {/* Tab Bar */}
            <div className="flex justify-center p-3">
              <ButtonGroup>
                <Button
                  size="sm"
                  variant={activeTab === "task" ? "secondary" : "ghost"}
                  className="h-8 px-3 gap-1.5"
                  onClick={() => setActiveTab("task")}
                >
                  <Target className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-xs">Task</span>
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "sprint" ? "secondary" : "ghost"}
                  className="h-8 px-3 gap-1.5"
                  onClick={() => setActiveTab("sprint")}
                >
                  <ListTodo className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-xs">Sprint</span>
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "map" ? "secondary" : "ghost"}
                  className="h-8 px-3 gap-1.5"
                  onClick={() => setActiveTab("map")}
                >
                  <Map className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-xs">Map</span>
                </Button>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Content */}
            <div className={cn(
              "overflow-y-auto p-4",
              chatExpanded ? "flex-1 min-h-0" : "flex-1"
            )}>
              {activeTab === "task" && <CurrentTaskView projectId={activeProjectId} />}
              {activeTab === "sprint" && <SprintTasksView projectId={activeProjectId} />}
              {activeTab === "map" && <ProjectMapView projectId={activeProjectId} />}
            </div>

            {/* Chat Section */}
            <div className={cn(
              "border-t border-border flex flex-col transition-all",
              chatExpanded ? "h-[280px]" : "h-9"
            )}>
              {/* Chat Toggle Header */}
              <button
                onClick={() => setChatExpanded(!chatExpanded)}
                className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium">AI Assistant</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                    !chatExpanded && "-rotate-180"
                  )}
                />
              </button>
              {chatExpanded && (
                <div className="flex-1 min-h-0">
                  <PanelChat projectId={activeProjectId} />
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// Current Task View - shows the active task that needs to be completed
function CurrentTaskView({ projectId }: { projectId: string | null }) {
  const { data: sprints, isLoading: sprintsLoading } = useSprints(projectId);
  const activeSprint = sprints?.find((s) => s.status === "active");
  const { data: tasks, isLoading: tasksLoading } = useTasks(activeSprint?.id || null);

  if (!projectId) {
    return <EmptyState message="Select a project to view tasks" />;
  }

  if (sprintsLoading || tasksLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!activeSprint) {
    return <EmptyState message="No active sprint" />;
  }

  // Find first incomplete task
  const currentTask = tasks?.find((t) => t.status === "in_progress") ||
    tasks?.find((t) => t.status === "todo");

  if (!currentTask) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-700 dark:text-green-400">All tasks complete!</p>
        <p className="text-xs text-muted-foreground mt-1">Sprint: {activeSprint.name}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {currentTask.status === "in_progress" ? (
              <Clock className="h-5 w-5 text-blue-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{currentTask.title}</p>
            {currentTask.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {currentTask.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                currentTask.status === "in_progress"
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-muted text-muted-foreground"
              )}>
                {currentTask.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Sprint: {activeSprint.name}
      </div>
    </div>
  );
}

// Sprint Tasks View - shows all tasks in the current sprint
function SprintTasksView({ projectId }: { projectId: string | null }) {
  const { data: sprints, isLoading: sprintsLoading } = useSprints(projectId);
  const activeSprint = sprints?.find((s) => s.status === "active");
  const { data: tasks, isLoading: tasksLoading } = useTasks(activeSprint?.id || null);

  if (!projectId) {
    return <EmptyState message="Select a project to view sprints" />;
  }

  if (sprintsLoading || tasksLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!activeSprint) {
    return <EmptyState message="No active sprint" />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState message="No tasks in this sprint" />;
  }

  const completedCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{activeSprint.name}</span>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(completedCount / tasks.length) * 100}%` }}
        />
      </div>
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors">
      {task.status === "done" ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : task.status === "in_progress" ? (
        <Clock className="h-4 w-4 text-blue-500 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className={cn(
        "text-sm truncate",
        task.status === "done" && "text-muted-foreground line-through"
      )}>
        {task.title}
      </span>
    </div>
  );
}

// Project Map View - shows all sprints and tasks in a tree structure
function ProjectMapView({ projectId }: { projectId: string | null }) {
  const { data: sprints, isLoading } = useSprints(projectId);

  if (!projectId) {
    return <EmptyState message="Select a project to view map" />;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!sprints || sprints.length === 0) {
    return <EmptyState message="No sprints in this project" />;
  }

  // Sort: active first, then planned, then completed
  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { active: 0, planned: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-1">
      {sortedSprints.map((sprint) => (
        <SprintTreeNode key={sprint.id} sprint={sprint} />
      ))}
    </div>
  );
}

function SprintTreeNode({ sprint }: { sprint: Sprint }) {
  const [isOpen, setIsOpen] = useState(sprint.status === "active");
  const { data: tasks } = useTasks(sprint.id);
  const completedCount = tasks?.filter((t) => t.status === "done").length ?? 0;
  const totalCount = tasks?.length ?? 0;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
      >
        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <span className="text-sm font-medium truncate flex-1 text-left">{sprint.name}</span>
        <span className="text-xs text-muted-foreground">{completedCount}/{totalCount}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      {isOpen && tasks && tasks.length > 0 && (
        <div className="ml-4 border-l border-border pl-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-sm text-muted-foreground text-center py-8">
      {message}
    </div>
  );
}

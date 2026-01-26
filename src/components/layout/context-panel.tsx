"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, GripVertical, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { SprintSummary } from "@/components/context/sprint-summary";

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;

export function ContextPanel() {
  const { contextPanelOpen, toggleContextPanel, contextPanelWidth, setContextPanelWidth } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const [isResizing, setIsResizing] = useState(false);
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
      {/* Collapse Toggle - Outside the aside so it's always visible */}
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
            <div className="flex h-14 items-center justify-center gap-2 px-4">
              <ListTodo className="h-4 w-4" />
              <h2 className="font-semibold">Sprint</h2>
            </div>

            <Separator />

            {/* Sprint Summary */}
            <div className="flex-1 overflow-y-auto p-4">
              <SprintSummary projectId={activeProjectId} />
            </div>
          </>
        )}
      </aside>
    </>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, Files, ListTodo, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { DocList } from "@/components/context/doc-list";
import { DocViewer } from "@/components/context/doc-viewer";
import { DocUpload } from "@/components/context/doc-upload";
import { FileTree } from "@/components/context/file-tree";
import { SprintSummary } from "@/components/context/sprint-summary";
import { useQueryClient } from "@tanstack/react-query";
import type { Document } from "@/lib/db/schema";

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;

export function ContextPanel() {
  const { contextPanelOpen, toggleContextPanel, contextPanelWidth, setContextPanelWidth } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState("docs");
  const [isResizing, setIsResizing] = useState(false);
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLElement>(null);

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["documents", activeProjectId] });
  };

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
            <div className="flex h-14 items-center justify-center px-4">
              <h2 className="font-semibold">Context</h2>
            </div>

            <Separator />

            {/* Tabs */}
            <div className="flex-1 overflow-hidden p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="docs" className="flex-1 gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Docs
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex-1 gap-1">
                    <Files className="h-3.5 w-3.5" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="sprint" className="flex-1 gap-1">
                    <ListTodo className="h-3.5 w-3.5" />
                    Sprint
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="docs" className="flex-1 overflow-hidden mt-4">
                  {selectedDoc ? (
                    <div className="h-full flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 w-fit"
                        onClick={() => setSelectedDoc(null)}
                      >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        Back to list
                      </Button>
                      <div className="flex-1 overflow-hidden rounded-md border border-border">
                        <DocViewer documentId={selectedDoc.id} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto space-y-4">
                      {activeProjectId && (
                        <DocUpload
                          projectId={activeProjectId}
                          onUploadComplete={handleUploadComplete}
                        />
                      )}
                      <DocList
                        projectId={activeProjectId}
                        selectedDocId={null}
                        onSelectDoc={handleSelectDoc}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="files" className="flex-1 overflow-y-auto mt-4">
                  <FileTree projectId={activeProjectId} />
                </TabsContent>

                <TabsContent value="sprint" className="flex-1 overflow-y-auto mt-4">
                  <SprintSummary projectId={activeProjectId} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Files, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { DocList } from "@/components/context/doc-list";
import { DocViewer } from "@/components/context/doc-viewer";
import { FileTree } from "@/components/context/file-tree";
import { SprintSummary } from "@/components/context/sprint-summary";
import type { Document } from "@/lib/db/schema";

export function ContextPanel() {
  const { contextPanelOpen, toggleContextPanel } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState("docs");

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
  };

  return (
    <>
      {/* Collapse Toggle - Outside the aside so it's always visible */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-0 top-4 h-6 w-6 rounded-l-full border border-r-0 border-border bg-background shadow-sm z-20 translate-x-0"
        style={{ right: contextPanelOpen ? "318px" : "0px" }}
        onClick={toggleContextPanel}
      >
        {contextPanelOpen ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <aside
        className={cn(
          "relative flex h-full flex-col border-l border-border bg-card transition-all duration-300",
          contextPanelOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >

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
                  <div className="h-full overflow-y-auto">
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

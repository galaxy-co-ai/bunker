"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, RefreshCw, Loader2, FolderSync, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface ProjectFilesSyncProps {
  projectId: string;
  projectPath: string | null;
  collapsed?: boolean;
}

interface FileTree {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTree[];
}

function countFiles(tree: FileTree): number {
  if (tree.type === "file") return 1;
  let count = 0;
  for (const child of tree.children || []) {
    count += countFiles(child);
  }
  return count;
}

export function ProjectFilesSync({ projectId, projectPath, collapsed }: ProjectFilesSyncProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  // Check if project has files
  useEffect(() => {
    async function checkFiles() {
      if (!projectPath) {
        setIsLoading(false);
        setHasFiles(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/files`);
        if (response.ok) {
          const data = await response.json();
          const count = countFiles(data.tree);
          setFileCount(count);
          setHasFiles(count > 0);
        } else {
          setHasFiles(false);
        }
      } catch {
        setHasFiles(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkFiles();
  }, [projectId, projectPath]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/auto-organize`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Sync failed");
      }

      const importedCount = data.organized?.length || 0;
      toast.success(
        "Sync complete",
        `${importedCount} document${importedCount !== 1 ? "s" : ""} imported`
      );
    } catch (error) {
      toast.error("Sync failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      await uploadFiles(files);
    },
    [projectId]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await uploadFiles(files);
      }
      e.target.value = "";
    },
    [projectId]
  );

  const uploadFiles = async (files: File[]) => {
    setIsSyncing(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch(`/api/projects/${projectId}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      const successCount = data.results?.filter((r: { success: boolean }) => r.success).length || 0;
      toast.success(
        "Upload complete",
        `${successCount} file${successCount !== 1 ? "s" : ""} added`
      );

      setHasFiles(true);
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Collapsed view
  if (collapsed) {
    return (
      <div className="p-2 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={hasFiles ? handleSync : undefined}
          disabled={isSyncing}
          className="h-8 w-8"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasFiles ? (
            <FolderSync className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Has files - show sync button
  if (hasFiles && projectPath) {
    return (
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full justify-start gap-2"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderSync className="h-4 w-4" />
          )}
          <span>Sync Files</span>
          <span className="ml-auto text-xs text-muted-foreground">{fileCount}</span>
        </Button>
      </div>
    );
  }

  // No files - show upload dropzone
  return (
    <div className="px-4 pb-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isSyncing && "pointer-events-none opacity-50"
        )}
      >
        {isSyncing ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
        <p className="mt-1.5 text-xs text-muted-foreground text-center">
          Drop files or{" "}
          <label className="cursor-pointer text-primary hover:underline">
            browse
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FolderSync, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectFilesSyncProps {
  projectId: string;
  projectPath: string | null;
  collapsed?: boolean;
  onSyncComplete?: () => void;
}

export function ProjectFilesSync({ projectId, projectPath, collapsed, onSyncComplete }: ProjectFilesSyncProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(projectPath || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const handleSync = async () => {
    if (!path.trim()) {
      toast.error("Error", "Please enter a directory path");
      return;
    }

    setIsSyncing(true);
    try {
      // First, update the project path if it changed
      if (path !== projectPath) {
        const updateResponse = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: path.trim() }),
        });

        if (!updateResponse.ok) {
          const data = await updateResponse.json();
          throw new Error(data.error?.message || "Failed to update project path");
        }
      }

      // Then trigger auto-organize
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
        `${importedCount} document${importedCount !== 1 ? "s" : ""} organized`
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });

      setOpen(false);
      onSyncComplete?.();
    } catch (error) {
      toast.error("Sync failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Collapsed view - just icon button
  if (collapsed) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
            <FolderSync className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <SyncDialogContent
          path={path}
          setPath={setPath}
          isSyncing={isSyncing}
          onSync={handleSync}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FolderSync className="h-4 w-4" />
          <span>Sync</span>
        </Button>
      </DialogTrigger>
      <SyncDialogContent
        path={path}
        setPath={setPath}
        isSyncing={isSyncing}
        onSync={handleSync}
        onCancel={() => setOpen(false)}
      />
    </Dialog>
  );
}

interface SyncDialogContentProps {
  path: string;
  setPath: (path: string) => void;
  isSyncing: boolean;
  onSync: () => void;
  onCancel: () => void;
}

function SyncDialogContent({ path, setPath, isSyncing, onSync, onCancel }: SyncDialogContentProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Sync Project Files</DialogTitle>
        <DialogDescription>
          Enter the path to your project directory. AI will automatically organize your files.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="project-path">Directory Path</Label>
          <Input
            id="project-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="C:\Users\You\Projects\my-app"
            onKeyDown={(e) => e.key === "Enter" && onSync()}
          />
          <p className="text-xs text-muted-foreground">
            Enter the full path to your local project folder
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSyncing}>
          Cancel
        </Button>
        <Button onClick={onSync} disabled={isSyncing}>
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            "Sync Files"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

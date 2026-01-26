"use client";

import { useState, useRef } from "react";
import { Plus, FolderSync, Pencil, Download, Loader2, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { EditableFileTree } from "@/components/context/editable-file-tree";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
  projectPath: string | null;
}

export function ProjectActions({ projectId, projectName, projectPath }: ProjectActionsProps) {
  const [syncOpen, setSyncOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [syncPath, setSyncPath] = useState(projectPath || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      // Determine endpoint based on file types
      const hasMedia = Array.from(files).some(f =>
        f.type.startsWith("image/") || f.type === "application/pdf"
      );
      const endpoint = hasMedia
        ? `/api/projects/${projectId}/media/upload`
        : `/api/projects/${projectId}/documents/upload`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      const successCount = data.results?.filter((r: { success: boolean }) => r.success).length || 0;
      toast.success("Upload complete", `${successCount} file${successCount !== 1 ? "s" : ""} added`);

      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sync handler
  const handleSync = async () => {
    if (!syncPath.trim()) {
      toast.error("Error", "Please enter a directory path");
      return;
    }

    setIsSyncing(true);
    try {
      if (syncPath !== projectPath) {
        const updateResponse = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: syncPath.trim() }),
        });

        if (!updateResponse.ok) {
          const data = await updateResponse.json();
          throw new Error(data.error?.message || "Failed to update project path");
        }
      }

      const response = await fetch(`/api/projects/${projectId}/auto-organize`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Sync failed");
      }

      const importedCount = data.organized?.length || 0;
      toast.success("Sync complete", `${importedCount} document${importedCount !== 1 ? "s" : ""} organized`);

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["files", projectId] });
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });

      setSyncOpen(false);
    } catch (error) {
      toast.error("Sync failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/export`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Export failed");
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `${projectName.replace(/[^a-zA-Z0-9-_]/g, "_")}_export.zip`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export complete", "Your project has been downloaded");
      setExportOpen(false);
    } catch (error) {
      toast.error("Export failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <ButtonGroup>
        {/* Upload Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Image className="mr-2 h-4 w-4" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <File className="mr-2 h-4 w-4" />
              File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sync Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setSyncOpen(true)}
        >
          <FolderSync className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {/* Edit Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {/* Export Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setExportOpen(true)}
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </ButtonGroup>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={handleUpload}
      />

      {/* Sync Dialog */}
      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Directory</DialogTitle>
            <DialogDescription>
              Enter the path to your local project directory. AI will organize your files automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sync-path">Directory Path</Label>
              <Input
                id="sync-path"
                value={syncPath}
                onChange={(e) => setSyncPath(e.target.value)}
                placeholder="C:\Users\You\Projects\my-app"
                onKeyDown={(e) => e.key === "Enter" && handleSync()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncOpen(false)} disabled={isSyncing}>
              Cancel
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit File Tree</DialogTitle>
            <DialogDescription>
              Manage your project structure - rename, create folders, or delete files.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <EditableFileTree projectId={projectId} onClose={() => setEditOpen(false)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Project</DialogTitle>
            <DialogDescription>
              Download your project files as a ZIP archive.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
              <p className="font-medium mb-2">Export includes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All documents</li>
                <li>Media files</li>
                <li>Project configuration</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export ZIP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

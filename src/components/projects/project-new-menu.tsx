"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Folder,
  Image,
  Plus,
  FileCode,
  FileSearch,
  File,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface ProjectNewMenuProps {
  projectId: string;
  collapsed?: boolean;
  onDocumentCreated?: () => void;
  onMediaUploaded?: () => void;
}

export function ProjectNewMenu({ projectId, collapsed, onDocumentCreated, onMediaUploaded }: ProjectNewMenuProps) {
  const [newDocDialog, setNewDocDialog] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"brief" | "prd" | "tad" | "other">("other");
  const [newDocFolder, setNewDocFolder] = useState<"planning" | "building" | "shipping" | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewDocument = (docType: "brief" | "prd" | "tad" | "other", folder: "planning" | "building" | "shipping" | null = null) => {
    setNewDocType(docType);
    setNewDocFolder(folder);
    setNewDocName("");
    setNewDocDialog(true);
  };

  const handleCreateDocument = async () => {
    if (!newDocName.trim()) {
      toast.error("Error", "Please enter a document name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDocName.trim(),
          content: "",
          docType: newDocType,
          folder: newDocFolder,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to create document");
      }

      toast.success("Document created", `${newDocName} has been created`);
      setNewDocDialog(false);
      onDocumentCreated?.();
    } catch (error) {
      toast.error("Error", error instanceof Error ? error.message : "Failed to create document");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const response = await fetch(`/api/projects/${projectId}/media/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      const successCount = data.results?.filter((r: { success: boolean }) => r.success).length || 0;
      if (successCount > 0) {
        toast.success("Upload complete", `${successCount} file${successCount > 1 ? "s" : ""} uploaded`);
        onMediaUploaded?.();
      }

      const failures = data.results?.filter((r: { success: boolean }) => !r.success) || [];
      if (failures.length > 0) {
        toast.error("Some files failed", failures.map((f: { name: string }) => f.name).join(", "));
      }
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploading(false);
      // Clear the input
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm">
            <Plus className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => handleNewDocument("other")}>
            <FileText className="mr-2 h-4 w-4" />
            Document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNewDocument("other", "planning")}>
            <Folder className="mr-2 h-4 w-4" />
            Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem onClick={() => handleNewDocument("other")}>
            <FileText className="mr-2 h-4 w-4" />
            Document
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Folder className="mr-2 h-4 w-4" />
              Folder
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleNewDocument("other", "planning")}>
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewDocument("other", "building")}>
                Building
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewDocument("other", "shipping")}>
                Shipping
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Image className="mr-2 h-4 w-4" />
              Media
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                disabled={isUploading}
                onClick={() => imageInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Image
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload File
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <File className="mr-2 h-4 w-4" />
              Document Type
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleNewDocument("brief", "planning")}>
                <FileText className="mr-2 h-4 w-4" />
                Brief
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewDocument("prd", "planning")}>
                <FileSearch className="mr-2 h-4 w-4" />
                PRD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewDocument("tad", "planning")}>
                <FileCode className="mr-2 h-4 w-4" />
                TAD
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New Document Dialog */}
      <Dialog open={newDocDialog} onOpenChange={setNewDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
            <DialogDescription>
              Create a new {newDocType !== "other" ? newDocType.toUpperCase() : "document"}
              {newDocFolder && ` in ${newDocFolder}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Name</Label>
              <Input
                id="doc-name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Document name"
                onKeyDown={(e) => e.key === "Enter" && handleCreateDocument()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDocDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs for media upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleMediaUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        className="sr-only"
        onChange={handleMediaUpload}
      />
    </>
  );
}

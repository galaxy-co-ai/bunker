"use client";

import { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileTreeResponse {
  tree: FileNode;
}

interface EditableFileTreeProps {
  projectId: string;
  onClose?: () => void;
}

interface TreeNodeProps {
  node: FileNode;
  projectId: string;
  depth?: number;
  onRefresh: () => void;
}

function TreeNode({ node, projectId, depth = 0, onRefresh }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const queryClient = useQueryClient();

  const isDirectory = node.type === "directory";
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch(`/api/projects/${projectId}/files/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: node.path, newName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to rename");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Renamed", `${isDirectory ? "Folder" : "File"} renamed successfully`);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error", error instanceof Error ? error.message : "Failed to rename");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/files/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: node.path }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to delete");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Deleted", `${isDirectory ? "Folder" : "File"} deleted successfully`);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error", error instanceof Error ? error.message : "Failed to delete");
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const newPath = node.path ? `${node.path}/${folderName}` : folderName;
      const response = await fetch(`/api/projects/${projectId}/files/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: newPath }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to create folder");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Created", "Folder created successfully");
      setNewFolderName("");
      setIsCreatingFolder(false);
      setIsOpen(true);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error", error instanceof Error ? error.message : "Failed to create folder");
    },
  });

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      renameMutation.mutate(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => isDirectory && setIsOpen(!isOpen)}
          className={cn("shrink-0", !isDirectory && "invisible")}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Icon */}
        {isDirectory ? (
          isOpen ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          )
        ) : (
          <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        {/* Name / Edit Input */}
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(node.name);
                }
              }}
              className="h-6 text-xs"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleRename}>
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => {
                setIsEditing(false);
                setEditName(node.name);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <span className="truncate flex-1">{node.name}</span>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                {isDirectory && (
                  <DropdownMenuItem onClick={() => setIsCreatingFolder(true)}>
                    <FolderPlus className="mr-2 h-3.5 w-3.5" />
                    New Folder
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* New Folder Input */}
      {isCreatingFolder && (
        <div
          className="flex items-center gap-1 px-2 py-1"
          style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
        >
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }
            }}
            placeholder="Folder name"
            className="h-6 text-xs flex-1"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCreateFolder}>
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              setIsCreatingFolder(false);
              setNewFolderName("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Children */}
      {isDirectory && isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              projectId={projectId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {isDirectory ? "folder" : "file"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{node.name}"?
              {isDirectory && hasChildren && " This will also delete all contents inside."}
              {" This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

async function fetchFileTree(projectId: string): Promise<FileNode | null> {
  const response = await fetch(`/api/projects/${projectId}/files`);
  if (!response.ok) {
    const error = await response.json();
    if (error.error?.code === "NO_PATH") {
      return null;
    }
    throw new Error("Failed to fetch file tree");
  }
  const data: FileTreeResponse = await response.json();
  return data.tree;
}

export function EditableFileTree({ projectId, onClose }: EditableFileTreeProps) {
  const queryClient = useQueryClient();
  const [isCreatingRootFolder, setIsCreatingRootFolder] = useState(false);
  const [newRootFolderName, setNewRootFolderName] = useState("");

  const {
    data: tree,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["files", projectId],
    queryFn: () => fetchFileTree(projectId),
    enabled: !!projectId,
    retry: false,
  });

  const createRootFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const response = await fetch(`/api/projects/${projectId}/files/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: folderName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to create folder");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Created", "Folder created successfully");
      setNewRootFolderName("");
      setIsCreatingRootFolder(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Error", error instanceof Error ? error.message : "Failed to create folder");
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["files", projectId] });
  }, [refetch, queryClient, projectId]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          No project directory configured.
        </p>
        <p className="text-xs text-muted-foreground">
          Use the Sync button to connect a local directory first.
        </p>
      </div>
    );
  }

  const hasChildren = tree.children && tree.children.length > 0;

  return (
    <div className="space-y-2">
      {/* Root actions */}
      <div className="flex items-center gap-2 px-2 pb-2 border-b border-border">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => setIsCreatingRootFolder(true)}
        >
          <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
          New Folder
        </Button>
      </div>

      {/* New root folder input */}
      {isCreatingRootFolder && (
        <div className="flex items-center gap-1 px-2 py-1">
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          <Input
            value={newRootFolderName}
            onChange={(e) => setNewRootFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newRootFolderName.trim()) {
                createRootFolderMutation.mutate(newRootFolderName.trim());
              }
              if (e.key === "Escape") {
                setIsCreatingRootFolder(false);
                setNewRootFolderName("");
              }
            }}
            placeholder="Folder name"
            className="h-6 text-xs flex-1"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              if (newRootFolderName.trim()) {
                createRootFolderMutation.mutate(newRootFolderName.trim());
              }
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              setIsCreatingRootFolder(false);
              setNewRootFolderName("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* File tree */}
      <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
        {hasChildren ? (
          tree.children!.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              projectId={projectId}
              onRefresh={handleRefresh}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No files in project directory
          </div>
        )}
      </div>
    </div>
  );
}

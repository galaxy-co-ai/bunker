"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileTreeResponse {
  tree: FileNode;
}

interface FileTreeProps {
  projectId: string | null;
}

interface TreeNodeProps {
  node: FileNode;
  depth?: number;
}

function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  const isDirectory = node.type === "directory";
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent",
          !isDirectory && "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0" />
              )
            ) : (
              <span className="w-3" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isDirectory && isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
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

export function FileTree({ projectId }: FileTreeProps) {
  const {
    data: tree,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["files", projectId],
    queryFn: () => fetchFileTree(projectId!),
    enabled: !!projectId,
    retry: false,
  });

  if (!projectId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a project to view files
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  // Silent fail - don't show errors, just return null
  if (error || !tree || !tree.children || tree.children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0.5">
      {tree.children.map((node) => (
        <TreeNode key={node.path} node={node} />
      ))}
    </div>
  );
}

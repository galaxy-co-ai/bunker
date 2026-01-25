"use client";

import { useState } from "react";
import {
  FileText,
  FileCode,
  FileSearch,
  File,
  ChevronRight,
  FolderOpen,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/use-documents";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@/lib/db/schema";

interface DocListProps {
  projectId: string | null;
  selectedDocId?: string | null;
  onSelectDoc: (doc: Document) => void;
}

const FOLDER_ORDER = ["planning", "building", "shipping"] as const;

const FOLDER_LABELS: Record<string, string> = {
  planning: "Planning",
  building: "Building",
  shipping: "Shipping",
};

function getDocIcon(docType: string | null) {
  switch (docType) {
    case "brief":
      return <FileText className="h-4 w-4" />;
    case "prd":
      return <FileSearch className="h-4 w-4" />;
    case "tad":
      return <FileCode className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

function getDocTypeLabel(docType: string | null) {
  switch (docType) {
    case "brief":
      return "Brief";
    case "prd":
      return "PRD";
    case "tad":
      return "TAD";
    default:
      return "Doc";
  }
}

export function DocList({ projectId, selectedDocId, onSelectDoc }: DocListProps) {
  const { data: documents, isLoading, error } = useDocuments(projectId);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(FOLDER_ORDER)
  );

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  };

  if (!projectId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a project to view documents
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">Failed to load documents</div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No documents in this project
      </div>
    );
  }

  // Group documents by folder
  const grouped = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const folder = doc.folder || "other";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(doc);
    return acc;
  }, {});

  // Get ordered folders (defined order first, then any others)
  const folders = [
    ...FOLDER_ORDER.filter((f) => grouped[f]?.length > 0),
    ...Object.keys(grouped).filter(
      (f) => !FOLDER_ORDER.includes(f as typeof FOLDER_ORDER[number])
    ),
  ];

  // If no folders are used (all docs have no folder), render flat list
  const hasAnyFolders = documents.some((d) => d.folder);
  if (!hasAnyFolders) {
    return (
      <div className="space-y-1">
        {documents.map((doc) => (
          <DocItem
            key={doc.id}
            doc={doc}
            selected={selectedDocId === doc.id}
            onSelect={onSelectDoc}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {folders.map((folder) => {
        const folderDocs = grouped[folder] || [];
        const isExpanded = expandedFolders.has(folder);
        const label = FOLDER_LABELS[folder] || folder;

        return (
          <div key={folder}>
            <button
              onClick={() => toggleFolder(folder)}
              className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
              {isExpanded ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
              <span>{label}</span>
              <span className="ml-auto text-xs text-muted-foreground/60">
                {folderDocs.length}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-border pl-2">
                {folderDocs.map((doc) => (
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    selected={selectedDocId === doc.id}
                    onSelect={onSelectDoc}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocItem({
  doc,
  selected,
  onSelect,
}: {
  doc: Document;
  selected: boolean;
  onSelect: (doc: Document) => void;
}) {
  return (
    <button
      onClick={() => onSelect(doc)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        selected && "bg-accent text-accent-foreground"
      )}
    >
      {getDocIcon(doc.docType)}
      <span className="flex-1 truncate text-left">{doc.name}</span>
      <span className="text-xs text-muted-foreground">
        {getDocTypeLabel(doc.docType)}
      </span>
    </button>
  );
}

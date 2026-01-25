"use client";

import { FileText, FileCode, FileSearch, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/use-documents";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@/lib/db/schema";

interface DocListProps {
  projectId: string | null;
  selectedDocId?: string | null;
  onSelectDoc: (doc: Document) => void;
}

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

  return (
    <div className="space-y-1">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectDoc(doc)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            selectedDocId === doc.id && "bg-accent text-accent-foreground"
          )}
        >
          {getDocIcon(doc.docType)}
          <span className="flex-1 truncate text-left">{doc.name}</span>
          <span className="text-xs text-muted-foreground">
            {getDocTypeLabel(doc.docType)}
          </span>
        </button>
      ))}
    </div>
  );
}

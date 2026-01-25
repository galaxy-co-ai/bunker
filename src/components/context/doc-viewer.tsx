"use client";

import { FileText } from "lucide-react";
import { useDocument } from "@/hooks/use-documents";
import { Skeleton } from "@/components/ui/skeleton";

interface DocViewerProps {
  documentId: string | null;
}

export function DocViewer({ documentId }: DocViewerProps) {
  const { data: document, isLoading, error } = useDocument(documentId);

  if (!documentId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a document to view
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        Failed to load document
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{document.name}</h3>
        </div>
        {document.docType && (
          <p className="mt-1 text-xs text-muted-foreground capitalize">
            {document.docType}
          </p>
        )}
      </div>
      <div className="p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-3 rounded-md overflow-x-auto">
            {document.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface DocUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
}

interface UploadResult {
  name: string;
  folder: string;
  docType: string;
  success: boolean;
  error?: string;
}

export function DocUpload({ projectId, onUploadComplete }: DocUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

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

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        /\.(md|mdx|txt|markdown)$/i.test(file.name)
      );

      if (files.length === 0) {
        toast.error("No valid files", "Please drop .md, .mdx, or .txt files");
        return;
      }

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
    setIsUploading(true);
    setResults([]);

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

      setResults(data.results || []);

      const successCount = data.results?.filter((r: UploadResult) => r.success).length || 0;
      if (successCount > 0) {
        toast.success(
          "Upload complete",
          `${successCount} document${successCount > 1 ? "s" : ""} organized`
        );
        onUploadComplete?.();
      }
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Analyzing with AI...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Drop files here or{" "}
              <label className="cursor-pointer text-primary hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  accept=".md,.mdx,.txt,.markdown"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground/60">.md, .mdx, .txt files</p>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Results</p>
          {results.map((result, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                result.success ? "bg-green-500/10" : "bg-red-500/10"
              )}
            >
              {result.success ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              )}
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 truncate">{result.name}</span>
              {result.success && (
                <span className="text-muted-foreground capitalize">{result.folder}</span>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setResults([])}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

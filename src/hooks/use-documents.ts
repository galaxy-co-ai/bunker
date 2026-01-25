import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Document } from "@/lib/db/schema";

interface DocumentsResponse {
  documents: Document[];
}

interface DocumentResponse {
  document: Document;
}

interface CreateDocumentInput {
  name: string;
  content: string;
  docType?: "brief" | "prd" | "tad" | "other";
}

interface UpdateDocumentInput {
  name?: string;
  content?: string;
  docType?: "brief" | "prd" | "tad" | "other" | null;
}

async function fetchDocuments(projectId: string): Promise<Document[]> {
  const response = await fetch(`/api/projects/${projectId}/documents`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  const data: DocumentsResponse = await response.json();
  return data.documents;
}

async function fetchDocument(id: string): Promise<Document> {
  const response = await fetch(`/api/documents/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }
  const data: DocumentResponse = await response.json();
  return data.document;
}

async function createDocument(
  projectId: string,
  input: CreateDocumentInput
): Promise<Document> {
  const response = await fetch(`/api/projects/${projectId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create document");
  }
  const data: DocumentResponse = await response.json();
  return data.document;
}

async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<Document> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update document");
  }
  const data: DocumentResponse = await response.json();
  return data.document;
}

async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

export function useDocuments(projectId: string | null) {
  return useQuery({
    queryKey: ["documents", projectId],
    queryFn: () => fetchDocuments(projectId!),
    enabled: !!projectId,
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => fetchDocument(id!),
    enabled: !!id,
  });
}

export function useCreateDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateDocumentInput & { id: string }) =>
      updateDocument(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["document", data.id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

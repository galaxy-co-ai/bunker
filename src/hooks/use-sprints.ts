import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Sprint } from "@/lib/db/schema";

interface SprintsResponse {
  sprints: Sprint[];
}

interface SprintResponse {
  sprint: Sprint;
}

interface CreateSprintInput {
  name: string;
  startDate?: number;
  endDate?: number;
}

interface UpdateSprintInput {
  name?: string;
  startDate?: number | null;
  endDate?: number | null;
  status?: "planned" | "active" | "completed";
}

async function fetchSprints(projectId: string): Promise<Sprint[]> {
  const response = await fetch(`/api/projects/${projectId}/sprints`);
  if (!response.ok) {
    throw new Error("Failed to fetch sprints");
  }
  const data: SprintsResponse = await response.json();
  return data.sprints;
}

async function fetchSprint(id: string): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch sprint");
  }
  const data: SprintResponse = await response.json();
  return data.sprint;
}

async function createSprint(
  projectId: string,
  input: CreateSprintInput
): Promise<Sprint> {
  const response = await fetch(`/api/projects/${projectId}/sprints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create sprint");
  }
  const data: SprintResponse = await response.json();
  return data.sprint;
}

async function updateSprint(
  id: string,
  input: UpdateSprintInput
): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update sprint");
  }
  const data: SprintResponse = await response.json();
  return data.sprint;
}

async function completeSprint(id: string): Promise<Sprint> {
  const response = await fetch(`/api/sprints/${id}/complete`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to complete sprint");
  }
  const data: SprintResponse = await response.json();
  return data.sprint;
}

async function deleteSprint(id: string): Promise<void> {
  const response = await fetch(`/api/sprints/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete sprint");
  }
}

export function useSprints(projectId: string | null) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => fetchSprints(projectId!),
    enabled: !!projectId,
  });
}

export function useSprint(id: string | null) {
  return useQuery({
    queryKey: ["sprint", id],
    queryFn: () => fetchSprint(id!),
    enabled: !!id,
  });
}

export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSprintInput) => createSprint(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateSprintInput & { id: string }) =>
      updateSprint(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprint", data.id] });
    },
  });
}

export function useCompleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprint", data.id] });
    },
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}

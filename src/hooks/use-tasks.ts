import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/lib/db/schema";

interface TasksResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}

interface CreateTaskInput {
  title: string;
  description?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: "todo" | "in_progress" | "done";
  orderIndex?: number;
}

async function fetchTasks(sprintId: string): Promise<Task[]> {
  const response = await fetch(`/api/sprints/${sprintId}/tasks`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const data: TasksResponse = await response.json();
  return data.tasks;
}

async function createTask(
  sprintId: string,
  input: CreateTaskInput
): Promise<Task> {
  const response = await fetch(`/api/sprints/${sprintId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  const data: TaskResponse = await response.json();
  return data.task;
}

async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update task");
  }
  const data: TaskResponse = await response.json();
  return data.task;
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}

export function useTasks(sprintId: string | null) {
  return useQuery({
    queryKey: ["tasks", sprintId],
    queryFn: () => fetchTasks(sprintId!),
    enabled: !!sprintId,
  });
}

export function useCreateTask(sprintId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(sprintId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", sprintId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTaskInput & { id: string }) =>
      updateTask(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.sprintId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "done" ? "todo" : "done";
      return updateTask(id, { status: newStatus as "todo" | "done" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.sprintId] });
    },
  });
}

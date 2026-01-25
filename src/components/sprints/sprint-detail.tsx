"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useCompleteSprint } from "@/hooks/use-sprints";
import { toast } from "@/lib/toast";
import type { Sprint, Task } from "@/lib/db/schema";

interface SprintDetailProps {
  sprint: Sprint;
  onSprintCompleted?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
});

type FormValues = z.infer<typeof formSchema>;

export function SprintDetail({ sprint, onSprintCompleted }: SprintDetailProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tasks, isLoading } = useTasks(sprint.id);
  const createTask = useCreateTask(sprint.id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeSprint = useCompleteSprint();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createTask.mutateAsync({ title: values.title });
      toast.success("Task added");
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === "done" ? "todo" : "done";
      await updateTask.mutateAsync({ id: task.id, status: newStatus });
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleCompleteSprint = async () => {
    try {
      await completeSprint.mutateAsync(sprint.id);
      toast.success("Sprint completed");
      onSprintCompleted?.();
    } catch (error) {
      toast.error("Failed to complete sprint");
    }
  };

  const completedTasks = tasks?.filter((t) => t.status === "done").length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{sprint.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {sprint.status}
          </p>
        </div>
        {sprint.status !== "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompleteSprint}
            disabled={completeSprint.isPending}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Complete Sprint
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {completedTasks} / {totalTasks} tasks
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Tasks</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3 w-3" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription>
                  Add a new task to this sprint.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="What needs to be done?"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTask.isPending}>
                    {createTask.isPending ? "Adding..." : "Add Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks yet. Add your first task to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    task.status === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground hover:border-primary"
                  )}
                >
                  {task.status === "done" && <Check className="h-3 w-3" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    task.status === "done" && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

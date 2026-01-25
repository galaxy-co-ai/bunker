"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, CheckCircle2, Circle, Clock, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSprints, useCreateSprint } from "@/hooks/use-sprints";
import { toast } from "@/lib/toast";
import type { Sprint } from "@/lib/db/schema";

interface SprintListProps {
  projectId: string;
  selectedSprintId?: string | null;
  onSelectSprint: (sprint: Sprint) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100),
});

type FormValues = z.infer<typeof formSchema>;

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "active":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "active":
      return "Active";
    default:
      return "Planned";
  }
}

export function SprintList({
  projectId,
  selectedSprintId,
  onSelectSprint,
}: SprintListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: sprints, isLoading, error } = useSprints(projectId);
  const createSprint = useCreateSprint(projectId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const sprint = await createSprint.mutateAsync({ name: values.name });
      toast.success("Sprint created", `"${sprint.name}" is ready`);
      setDialogOpen(false);
      form.reset();
      onSelectSprint(sprint);
    } catch (error) {
      toast.error("Failed to create sprint", "Please try again");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">Failed to load sprints</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Sprints</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              New Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sprint</DialogTitle>
              <DialogDescription>
                Add a new sprint to organize your work.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sprint-name">Sprint Name</Label>
                <Input
                  id="sprint-name"
                  placeholder="Sprint 1"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
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
                <Button type="submit" disabled={createSprint.isPending}>
                  {createSprint.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!sprints || sprints.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No sprints yet. Create your first sprint to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sprints.map((sprint) => (
            <button
              key={sprint.id}
              onClick={() => onSelectSprint(sprint)}
              className={cn(
                "w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent",
                selectedSprintId === sprint.id && "bg-accent border-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(sprint.status)}
                  <span className="font-medium">{sprint.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(sprint.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

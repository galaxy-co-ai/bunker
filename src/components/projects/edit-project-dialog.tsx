"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Pencil } from "lucide-react";
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
import { useUpdateProject } from "@/hooks/use-projects";
import { toast } from "@/lib/toast";
import type { Project } from "@/lib/db/schema";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  path: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProjectDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

export function EditProjectDialog({ project, trigger }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const updateProject = useUpdateProject();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      path: project.path ?? "",
    },
  });

  // Reset form when project changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        path: project.path ?? "",
      });
    }
  }, [open, project, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        name: values.name,
        description: values.description || null,
        path: values.path || null,
      });

      toast.success("Project updated", `"${values.name}" has been updated`);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update project", "Please try again");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project&apos;s details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              placeholder="My Awesome Project"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              placeholder="A brief description of your project"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-path">Project Path (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-path"
                placeholder="C:\Users\Projects\my-project"
                {...form.register("path")}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" disabled>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Path to the project folder on your computer
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

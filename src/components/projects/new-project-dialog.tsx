"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Plus } from "lucide-react";
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
import { useCreateProject } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { toast } from "@/lib/toast";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  path: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewProjectDialogProps {
  trigger?: React.ReactNode;
}

export function NewProjectDialog({ trigger }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setActiveProjectId } = useProjectStore();
  const createProject = useCreateProject();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      path: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const project = await createProject.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        path: values.path || undefined,
      });

      toast.success("Project created", `"${project.name}" is ready to use`);
      setOpen(false);
      form.reset();
      setActiveProjectId(project.id);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      toast.error("Failed to create project", "Please try again");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track its context and communicate with AI.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
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
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
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
            <Label htmlFor="path">Project Path (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="path"
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
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

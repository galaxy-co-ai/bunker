"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { useDeleteProject } from "@/hooks/use-projects";
import { useProjectStore } from "@/stores/project-store";
import { toast } from "@/lib/toast";
import type { Project } from "@/lib/db/schema";

interface DeleteProjectDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

export function DeleteProjectDialog({
  project,
  trigger,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { activeProjectId, setActiveProjectId } = useProjectStore();
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);

      toast.success("Project deleted", `"${project.name}" has been removed`);

      // If we deleted the active project, clear it and go home
      if (activeProjectId === project.id) {
        setActiveProjectId(null);
        router.push("/projects");
      }

      setOpen(false);
    } catch (error) {
      toast.error("Failed to delete project", "Please try again");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{project.name}&quot;? This
            action cannot be undone. All sprints, tasks, and documents
            associated with this project will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

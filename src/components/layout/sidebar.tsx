"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { ProjectList } from "@/components/projects/project-list";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { ConnectorsPanel } from "@/components/connectors/connectors-panel";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <Link href="/" className="flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Bunker</span>
          </Link>
        )}
        {!sidebarOpen && (
          <Link href="/" className="mx-auto">
            <Box className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      <Separator />

      {/* New Project Button */}
      <div className="p-3">
        <NewProjectDialog
          trigger={
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2",
                !sidebarOpen && "px-0 justify-center"
              )}
            >
              <Plus className="h-4 w-4" />
              {sidebarOpen && <span>New Project</span>}
            </Button>
          }
        />
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-3">
        {sidebarOpen && (
          <div className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Projects
          </div>
        )}
        <ProjectList collapsed={!sidebarOpen} />
      </div>

      <Separator />

      {/* Connectors Button */}
      <div className="p-3 pb-0">
        <ConnectorsPanel collapsed={!sidebarOpen} />
      </div>

      {/* Settings Link */}
      <div className="p-3">
        <Link href="/settings">
          <Button
            variant={pathname === "/settings" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              !sidebarOpen && "px-0 justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {sidebarOpen && <span>Settings</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

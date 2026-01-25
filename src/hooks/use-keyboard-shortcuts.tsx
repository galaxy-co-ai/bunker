"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleSidebar, toggleContextPanel } = useUIStore();
  const { activeProjectId } = useProjectStore();

  const shortcuts: ShortcutHandler[] = [
    {
      key: "b",
      ctrl: true,
      handler: toggleSidebar,
      description: "Toggle sidebar",
    },
    {
      key: ".",
      ctrl: true,
      handler: toggleContextPanel,
      description: "Toggle context panel",
    },
    {
      key: ",",
      ctrl: true,
      handler: () => router.push("/settings"),
      description: "Open settings",
    },
    {
      key: "1",
      ctrl: true,
      handler: () => {
        if (activeProjectId) {
          router.push(`/projects/${activeProjectId}`);
        }
      },
      description: "Go to project roadmap",
    },
    {
      key: "2",
      ctrl: true,
      handler: () => {
        if (activeProjectId) {
          router.push(`/projects/${activeProjectId}/sprints`);
        }
      },
      description: "Go to sprints",
    },
    {
      key: "3",
      ctrl: true,
      handler: () => {
        if (activeProjectId) {
          router.push(`/projects/${activeProjectId}/chat`);
        }
      },
      description: "Go to chat",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
        const modifierMatch = ctrlOrMeta
          ? event.ctrlKey || event.metaKey
          : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modifierMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return shortcuts;
}

// Component to register keyboard shortcuts globally
export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

"use client";

import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto bg-background",
        className
      )}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </main>
  );
}

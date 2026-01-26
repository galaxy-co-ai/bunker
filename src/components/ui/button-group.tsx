import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-background shadow-sm",
          "[&>button]:rounded-none [&>button]:border-0 [&>button]:shadow-none",
          "[&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md",
          "[&>button:not(:last-child)]:border-r [&>button:not(:last-child)]:border-border",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };

import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-neutral-900 text-neutral-50 hover:bg-neutral-800 hover:shadow-lg":
              variant === "default",
            "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900":
              variant === "outline",
            "hover:bg-neutral-100 hover:text-neutral-900": variant === "ghost",
            "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg":
              variant === "primary",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-11 rounded-xl px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

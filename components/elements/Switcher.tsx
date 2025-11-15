"use client";

import React, { ReactElement } from "react";
import { cn } from "@/lib/utils";

type SwitcherProps = {
  activeIndex: number;
  children: ReactElement[];
  icon?: ReactElement;
};

export const Switcher: React.FC<SwitcherProps> = ({
  activeIndex,
  children,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <div className="flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}

      <div
        className={cn(
          "inline-flex items-center gap-1",
          "rounded-full bg-muted/60 px-1 py-1"
        )}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium",
              "transition-colors",
              index === activeIndex
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

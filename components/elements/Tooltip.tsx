"use client";

import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface TooltipProps {
  text: string;
  hideIcon?: boolean;
  textAlignCenter?: boolean;
  children?: React.ReactNode;
}

export default function TooltipInfo({
  text,
  hideIcon = false,
  textAlignCenter = false,
  children,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {hideIcon ? (
            children
          ) : (
            <button
              type="button"
              className="flex items-center justify-center text-muted-foreground hover:text-foreground transition"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className={`max-w-xs p-3 text-sm shadow-xl border bg-popover backdrop-blur-xl ${
            textAlignCenter ? "text-center" : "text-left"
          }`}
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

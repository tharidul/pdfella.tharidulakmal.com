import type { HTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import { cn } from "@/lib/utils";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";
export type DividerSpacing = "none" | "sm" | "md" | "lg";
export type DividerColor = ComponentColor;

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: DividerSpacing;
  color?: DividerColor;
  label?: ReactNode;
}

const HORIZONTAL_SPACING: Record<DividerSpacing, string> = {
  none: "my-0",
  sm: "my-2",
  md: "my-4 sm:my-6",
  lg: "my-8 sm:my-12",
};

const VERTICAL_SPACING: Record<DividerSpacing, string> = {
  none: "mx-0",
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6 sm:mx-8",
};

const BORDER_STYLES: Record<DividerVariant, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const COLOR_STYLES: Record<DividerColor, string> = {
  default: "border-neutral-200",
  ebony: "border-ebony/30",
  "soft-fawn": "border-soft-fawn/40",
  "saddle-brown": "border-saddle-brown/30",
  "olive-bark": "border-olive-bark/30",
  "rich-mahogany": "border-rich-mahogany/30",
};

export function Divider({
  orientation = "horizontal",
  variant = "solid",
  spacing = "md",
  color = "default",
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "inline-block h-auto self-stretch border-l",
          COLOR_STYLES[color],
          BORDER_STYLES[variant],
          VERTICAL_SPACING[spacing],
          className
        )}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          "relative flex items-center w-full",
          HORIZONTAL_SPACING[spacing],
          className
        )}
        {...props}
      >
        <div
          className={cn("grow border-t", COLOR_STYLES[color], BORDER_STYLES[variant])}
        />
        <span className="shrink-0 px-3 text-xs font-medium text-neutral-500">
          {label}
        </span>
        <div
          className={cn("grow border-t", COLOR_STYLES[color], BORDER_STYLES[variant])}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "w-full border-t",
        COLOR_STYLES[color],
        BORDER_STYLES[variant],
        HORIZONTAL_SPACING[spacing],
        className
      )}
      {...props}
    />
  );
}

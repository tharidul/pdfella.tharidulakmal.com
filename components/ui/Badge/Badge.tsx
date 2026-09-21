import type { HTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import { cn } from "@/lib/utils";

export type BadgeVariant = "solid" | "subtle" | "outline";
export type BadgeColor =
  | ComponentColor
  | "success"
  | "warning"
  | "error";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  children?: ReactNode;
}

const BADGE_BASE_STYLES =
  "inline-flex items-center justify-center font-medium rounded-full transition-colors";

const BADGE_SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

const BADGE_COLOR_MATRIX: Record<BadgeVariant, Record<BadgeColor, string>> = {
  solid: {
    default: "bg-neutral-900 text-white",
    ebony: "bg-ebony text-white",
    "soft-fawn": "bg-soft-fawn text-neutral-900",
    "saddle-brown": "bg-saddle-brown text-white",
    "olive-bark": "bg-olive-bark text-white",
    "rich-mahogany": "bg-rich-mahogany text-white",
    success: "bg-ebony text-white",
    warning: "bg-olive-bark text-white",
    error: "bg-rich-mahogany text-white",
  },
  subtle: {
    default: "bg-neutral-100 text-neutral-800",
    ebony: "bg-ebony/15 text-ebony",
    "soft-fawn": "bg-soft-fawn/30 text-neutral-900",
    "saddle-brown": "bg-saddle-brown/15 text-saddle-brown",
    "olive-bark": "bg-olive-bark/15 text-olive-bark",
    "rich-mahogany": "bg-rich-mahogany/15 text-rich-mahogany",
    success: "bg-ebony/15 text-ebony",
    warning: "bg-olive-bark/15 text-olive-bark",
    error: "bg-rich-mahogany/15 text-rich-mahogany",
  },
  outline: {
    default: "border border-neutral-300 text-neutral-800",
    ebony: "border border-ebony text-ebony",
    "soft-fawn": "border border-soft-fawn text-neutral-900",
    "saddle-brown": "border border-saddle-brown text-saddle-brown",
    "olive-bark": "border border-olive-bark text-olive-bark",
    "rich-mahogany": "border border-rich-mahogany text-rich-mahogany",
    success: "border border-ebony text-ebony",
    warning: "border border-olive-bark text-olive-bark",
    error: "border border-rich-mahogany text-rich-mahogany",
  },
};

export function Badge({
  variant = "subtle",
  color = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        BADGE_BASE_STYLES,
        BADGE_SIZE_STYLES[size],
        BADGE_COLOR_MATRIX[variant][color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

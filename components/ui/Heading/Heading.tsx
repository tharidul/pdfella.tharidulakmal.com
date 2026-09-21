import type { HTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import { cn } from "@/lib/utils";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "display";
export type HeadingWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type HeadingAlign = "left" | "center" | "right";
export type HeadingColor = ComponentColor | "muted";

export type HeadingFont = "sans" | "serif" | "script";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  align?: HeadingAlign;
  color?: HeadingColor;
  font?: HeadingFont;
  children?: ReactNode;
}

const DEFAULT_SIZES: Record<HeadingLevel, HeadingSize> = {
  h1: "2xl",
  h2: "xl",
  h3: "lg",
  h4: "md",
  h5: "sm",
  h6: "xs",
};

const HEADING_SIZE_STYLES: Record<HeadingSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
  xl: "text-2xl sm:text-3xl lg:text-4xl",
  "2xl": "text-3xl sm:text-4xl lg:text-5xl",
  display: "text-4xl sm:text-5xl lg:text-6xl font-extrabold",
};

const HEADING_WEIGHT_STYLES: Record<HeadingWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const HEADING_ALIGN_STYLES: Record<HeadingAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const HEADING_COLOR_STYLES: Record<HeadingColor, string> = {
  default: "text-neutral-900",
  muted: "text-neutral-500",
  ebony: "text-ebony",
  "soft-fawn": "text-soft-fawn",
  "saddle-brown": "text-saddle-brown",
  "olive-bark": "text-olive-bark",
  "rich-mahogany": "text-rich-mahogany",
};

const HEADING_FONT_STYLES: Record<HeadingFont, string> = {
  sans: "font-sans",
  serif: "font-serif",
  script: "font-script",
};

export function Heading({
  as: Component = "h2",
  size,
  weight = "bold",
  align,
  color = "default",
  font = "sans",
  className,
  children,
  ...props
}: HeadingProps) {
  const resolvedSize = size ?? DEFAULT_SIZES[Component];
  const hasExplicitTextColor = className
    ? className.split(/\s+/).some((c) => c.startsWith("text-"))
    : false;
  const resolvedColorStyle =
    hasExplicitTextColor && color === "default" ? "" : HEADING_COLOR_STYLES[color];

  return (
    <Component
      className={cn(
        "tracking-tight",
        HEADING_FONT_STYLES[font],
        HEADING_SIZE_STYLES[resolvedSize],
        HEADING_WEIGHT_STYLES[weight],
        align ? HEADING_ALIGN_STYLES[align] : undefined,
        resolvedColorStyle,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

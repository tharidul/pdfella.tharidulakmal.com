import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import { cn } from "@/lib/utils";

export type TextElement = "p" | "span" | "div" | "label" | "small";
export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextVariant = "default" | "muted" | "subtle" | "contrast";
export type TextColor = ComponentColor;
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement | ElementType;
  size?: TextSize;
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  children?: ReactNode;
}

const TEXT_SIZE_STYLES: Record<TextSize, string> = {
  xs: "text-xs leading-4",
  sm: "text-sm leading-5",
  base: "text-base leading-6",
  lg: "text-lg leading-7",
  xl: "text-xl leading-8",
};

const TEXT_VARIANT_STYLES: Record<TextVariant, string> = {
  default: "text-neutral-700",
  muted: "text-neutral-500",
  subtle: "text-neutral-400",
  contrast: "text-neutral-900 font-medium",
};

const TEXT_COLOR_STYLES: Record<Exclude<TextColor, "default">, string> = {
  ebony: "text-ebony",
  "soft-fawn": "text-soft-fawn",
  "saddle-brown": "text-saddle-brown",
  "olive-bark": "text-olive-bark",
  "rich-mahogany": "text-rich-mahogany",
};

const TEXT_WEIGHT_STYLES: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const TEXT_ALIGN_STYLES: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Text({
  as: Component = "p",
  size = "base",
  variant = "default",
  color = "default",
  weight = "normal",
  align,
  className,
  children,
  ...props
}: TextProps) {
  const hasExplicitTextColor = className
    ? className.split(/\s+/).some((c) => c.startsWith("text-"))
    : false;

  const resolvedColorStyle =
    hasExplicitTextColor && color === "default" && variant === "default"
      ? ""
      : color !== "default"
        ? TEXT_COLOR_STYLES[color]
        : TEXT_VARIANT_STYLES[variant];

  return (
    <Component
      className={cn(
        TEXT_SIZE_STYLES[size],
        resolvedColorStyle,
        TEXT_WEIGHT_STYLES[weight],
        align ? TEXT_ALIGN_STYLES[align] : undefined,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

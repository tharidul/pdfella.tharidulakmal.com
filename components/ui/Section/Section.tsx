import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";
export type SectionVariant = "default" | "muted" | "brand" | "inverted";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  spacing?: SectionSpacing;
  variant?: SectionVariant;
  children?: ReactNode;
}

const SECTION_SPACING_STYLES: Record<SectionSpacing, string> = {
  none: "py-0",
  sm: "py-8 sm:py-12",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
  xl: "py-20 sm:py-32",
};

const SECTION_VARIANT_STYLES: Record<SectionVariant, string> = {
  default: "",
  muted: "bg-neutral-50 dark:bg-neutral-900/50",
  brand: "bg-rich-mahogany text-white dark:bg-soft-fawn dark:text-neutral-900",
  inverted: "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950",
};

export function Section({
  as: Component = "section",
  spacing = "lg",
  variant = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(
        "w-full",
        SECTION_SPACING_STYLES[spacing],
        SECTION_VARIANT_STYLES[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

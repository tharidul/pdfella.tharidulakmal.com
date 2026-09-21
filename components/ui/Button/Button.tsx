import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import { cn } from "@/lib/utils";

export type ButtonVariant = "solid" | "primary" | "secondary" | "outline" | "ghost";
export type ButtonColor = ComponentColor;
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button" | "span";
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const BUTTON_BASE_STYLES =
  "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const BUTTON_SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const BUTTON_COLOR_STYLES: Record<
  "solid" | "secondary" | "outline" | "ghost",
  Record<ButtonColor, string>
> = {
  solid: {
    default:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900",
    ebony: "bg-ebony text-white hover:opacity-90 focus-visible:ring-ebony",
    "soft-fawn": "bg-soft-fawn text-neutral-900 hover:opacity-90 focus-visible:ring-soft-fawn",
    "saddle-brown": "bg-saddle-brown text-white hover:opacity-90 focus-visible:ring-saddle-brown",
    "olive-bark": "bg-olive-bark text-white hover:opacity-90 focus-visible:ring-olive-bark",
    "rich-mahogany": "bg-rich-mahogany text-white hover:opacity-90 focus-visible:ring-rich-mahogany",
  },
  secondary: {
    default:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500",
    ebony: "bg-ebony/10 text-ebony hover:bg-ebony/20 focus-visible:ring-ebony",
    "soft-fawn": "bg-soft-fawn/20 text-neutral-900 hover:bg-soft-fawn/30 focus-visible:ring-soft-fawn",
    "saddle-brown": "bg-saddle-brown/10 text-saddle-brown hover:bg-saddle-brown/20 focus-visible:ring-saddle-brown",
    "olive-bark": "bg-olive-bark/10 text-olive-bark hover:bg-olive-bark/20 focus-visible:ring-olive-bark",
    "rich-mahogany": "bg-rich-mahogany/10 text-rich-mahogany hover:bg-rich-mahogany/20 focus-visible:ring-rich-mahogany",
  },
  outline: {
    default:
      "border border-neutral-300 text-neutral-900 hover:bg-neutral-100 focus-visible:ring-neutral-500",
    ebony: "border border-ebony text-ebony hover:bg-ebony/10 focus-visible:ring-ebony",
    "soft-fawn": "border border-soft-fawn text-neutral-900 hover:bg-soft-fawn/15 focus-visible:ring-soft-fawn",
    "saddle-brown": "border border-saddle-brown text-saddle-brown hover:bg-saddle-brown/10 focus-visible:ring-saddle-brown",
    "olive-bark": "border border-olive-bark text-olive-bark hover:bg-olive-bark/10 focus-visible:ring-olive-bark",
    "rich-mahogany": "border border-rich-mahogany text-rich-mahogany hover:bg-rich-mahogany/10 focus-visible:ring-rich-mahogany",
  },
  ghost: {
    default:
      "text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-500",
    ebony: "text-ebony hover:bg-ebony/10 focus-visible:ring-ebony",
    "soft-fawn": "text-neutral-900 hover:bg-soft-fawn/20 focus-visible:ring-soft-fawn",
    "saddle-brown": "text-saddle-brown hover:bg-saddle-brown/10 focus-visible:ring-saddle-brown",
    "olive-bark": "text-olive-bark hover:bg-olive-bark/10 focus-visible:ring-olive-bark",
    "rich-mahogany": "text-rich-mahogany hover:bg-rich-mahogany/10 focus-visible:ring-rich-mahogany",
  },
};

export function Button({
  className,
  variant = "solid",
  color = "default",
  size = "md",
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  as = "button",
  ...props
}: ButtonProps) {
  const resolvedVariant = variant === "primary" ? "solid" : variant;
  const combinedClassName = cn(
    BUTTON_BASE_STYLES,
    BUTTON_SIZE_STYLES[size],
    BUTTON_COLOR_STYLES[resolvedVariant][color],
    className
  );

  const content = (
    <>
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </>
  );

  if (as === "span") {
    return (
      <span className={combinedClassName} aria-disabled={disabled ?? isLoading}>
        {content}
      </span>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {content}
    </button>
  );
}

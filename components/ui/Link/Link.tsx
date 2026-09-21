import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { ComponentColor } from "@/types";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { cn } from "@/lib/utils";

export type LinkVariant = "default" | "subtle" | "underline" | "nav";
export type LinkColor = ComponentColor;

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>,
    NextLinkProps {
  variant?: LinkVariant;
  color?: LinkColor;
  isExternal?: boolean;
  showExternalIcon?: boolean;
  className?: string;
  children?: ReactNode;
}

const LINK_BASE_STYLES = "inline-flex items-center gap-1 transition-colors cursor-pointer";

const LINK_VARIANT_STYLES: Record<LinkVariant, string> = {
  default: "text-neutral-900 hover:text-neutral-600 font-medium",
  subtle: "text-neutral-600 hover:text-neutral-900",
  underline: "text-neutral-900 underline underline-offset-4 hover:opacity-80",
  nav: "text-neutral-600 hover:text-neutral-950 font-medium text-sm",
};

const LINK_COLOR_STYLES: Record<Exclude<LinkColor, "default">, string> = {
  ebony: "text-ebony hover:opacity-80 font-medium",
  "soft-fawn": "text-soft-fawn hover:opacity-80 font-medium",
  "saddle-brown": "text-saddle-brown hover:opacity-80 font-medium",
  "olive-bark": "text-olive-bark hover:opacity-80 font-medium",
  "rich-mahogany": "text-rich-mahogany hover:opacity-80 font-medium",
};

function ExternalIcon() {
  return (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function checkIsExternal(href: NextLinkProps["href"], isExternal?: boolean): boolean {
  if (isExternal !== undefined) return isExternal;
  return typeof href === "string" && (href.startsWith("http") || href.startsWith("//"));
}

export function Link({
  href,
  variant = "default",
  color = "default",
  isExternal,
  showExternalIcon = false,
  className,
  children,
  ...props
}: LinkProps) {
  const isTargetExternal = checkIsExternal(href, isExternal);
  const resolvedColorStyle =
    color !== "default" ? LINK_COLOR_STYLES[color] : LINK_VARIANT_STYLES[variant];

  const externalProps = isTargetExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <NextLink
      href={href}
      className={cn(LINK_BASE_STYLES, resolvedColorStyle, className)}
      {...externalProps}
      {...props}
    >
      {children}
      {isTargetExternal && showExternalIcon && <ExternalIcon />}
    </NextLink>
  );
}

import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

export interface LogoProps extends ComponentPropsWithoutRef<"div"> {
  isCollapsed?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export function Logo({
  isCollapsed = false,
  size = "md",
  variant = "full",
  className = "",
  ...props
}: LogoProps) {
  const isIconOnly = isCollapsed || variant === "icon";

  const iconDimensions = {
    sm: { width: 32, height: 32, class: "h-8 w-8" },
    md: { width: 36, height: 36, class: "h-9 w-9" },
    lg: { width: 44, height: 44, class: "h-11 w-11" },
  }[size];

  const fullDimensions = {
    sm: { width: 125, height: 32, class: "h-7 sm:h-8 w-auto" },
    md: { width: 140, height: 36, class: "h-8 sm:h-9 w-auto" },
    lg: { width: 170, height: 44, class: "h-10 sm:h-11 w-auto" },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      {...props}
    >
      {isIconOnly ? (
        <Image
          src="/logo.webp"
          alt="PDFella"
          width={iconDimensions.width}
          height={iconDimensions.height}
          priority
          className={`${iconDimensions.class} object-contain rounded-xl drop-shadow-2xs shrink-0`}
        />
      ) : (
        <Image
          src="/logo_with_text.webp"
          alt="PDFella"
          width={fullDimensions.width}
          height={fullDimensions.height}
          priority
          className={`${fullDimensions.class} object-contain drop-shadow-2xs shrink-0`}
        />
      )}
    </div>
  );
}

import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

export type ImageAspectRatio = "auto" | "square" | "video" | "wide" | "portrait";
export type ImageRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type ImageFit = "cover" | "contain" | "fill";
export type ImageShadow = "none" | "sm" | "md" | "lg";

export interface ImageProps extends Omit<NextImageProps, "className"> {
  aspectRatio?: ImageAspectRatio;
  radius?: ImageRadius;
  fit?: ImageFit;
  shadow?: ImageShadow;
  className?: string;
  containerClassName?: string;
}

const IMAGE_ASPECT_STYLES: Record<ImageAspectRatio, string> = {
  auto: "",
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
};

const IMAGE_RADIUS_STYLES: Record<ImageRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
};

const IMAGE_FIT_STYLES: Record<ImageFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
};

const IMAGE_SHADOW_STYLES: Record<ImageShadow, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-xl",
};

export function Image({
  aspectRatio = "auto",
  radius = "none",
  fit = "cover",
  shadow = "none",
  className,
  containerClassName,
  alt,
  fill,
  ...props
}: ImageProps) {
  if (fill || aspectRatio !== "auto") {
    return (
      <div
        className={cn(
          "relative overflow-hidden w-full",
          IMAGE_ASPECT_STYLES[aspectRatio],
          IMAGE_RADIUS_STYLES[radius],
          IMAGE_SHADOW_STYLES[shadow],
          containerClassName
        )}
      >
        <NextImage
          fill={fill ?? true}
          alt={alt}
          className={cn(IMAGE_FIT_STYLES[fit], IMAGE_RADIUS_STYLES[radius], className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <NextImage
      alt={alt}
      className={cn(
        IMAGE_FIT_STYLES[fit],
        IMAGE_RADIUS_STYLES[radius],
        IMAGE_SHADOW_STYLES[shadow],
        className
      )}
      {...props}
    />
  );
}

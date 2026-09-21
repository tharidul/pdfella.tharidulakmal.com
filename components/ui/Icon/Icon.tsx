import type { ComponentPropsWithoutRef } from "react";
import type { IconType } from "react-icons";
import {
  HiArrowRight,
  HiArrowLeft,
  HiArrowUp,
  HiArrowDown,
  HiChevronDown,
  HiChevronUp,
  HiChevronRight,
  HiCheck,
  HiXMark,
  HiBars3,
  HiInformationCircle,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiEnvelope,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
  HiSparkles,
  HiSquares2X2,
  HiUsers,
  HiGlobeAlt,
  HiPlus,
  HiTrash,
  HiLockClosed,
  HiSun,
  HiDocumentText,
  HiPhoto,
} from "react-icons/hi2";
import {
  FaLeaf,
  FaSeedling,
  FaGear,
  FaGem,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaScissors,
} from "react-icons/fa6";
import { CgSpinner } from "react-icons/cg";
import { RxDragHandleDots2 } from "react-icons/rx";
import { cn } from "@/lib/utils";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "chevron-down"
  | "chevron-up"
  | "chevron-right"
  | "check"
  | "close"
  | "menu"
  | "info"
  | "alert"
  | "spinner"
  | "search"
  | "mail"
  | "map-pin"
  | "phone"
  | "leaf"
  | "sprout"
  | "cog"
  | "users"
  | "shield"
  | "shield-check"
  | "diamond"
  | "sparkles"
  | "layers"
  | "globe"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "whatsapp"
  | "plus"
  | "trash"
  | "lock"
  | "sun"
  | "document"
  | "photo"
  | "scissors"
  | "drag-handle";

export interface IconProps extends ComponentPropsWithoutRef<"svg"> {
  name?: IconName;
  size?: IconSize;
  icon?: IconType;
}

const ICON_SIZE_STYLES: Record<IconSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const ICON_MAP: Record<IconName, IconType> = {
  "arrow-right": HiArrowRight,
  "arrow-left": HiArrowLeft,
  "arrow-up": HiArrowUp,
  "arrow-down": HiArrowDown,
  "chevron-down": HiChevronDown,
  "chevron-up": HiChevronUp,
  "chevron-right": HiChevronRight,
  check: HiCheck,
  close: HiXMark,
  menu: HiBars3,
  info: HiInformationCircle,
  alert: HiExclamationTriangle,
  spinner: CgSpinner,
  search: HiMagnifyingGlass,
  mail: HiEnvelope,
  "map-pin": HiMapPin,
  phone: HiPhone,
  leaf: FaLeaf,
  sprout: FaSeedling,
  cog: FaGear,
  users: HiUsers,
  shield: HiShieldCheck,
  "shield-check": HiShieldCheck,
  diamond: FaGem,
  sparkles: HiSparkles,
  layers: HiSquares2X2,
  globe: HiGlobeAlt,
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  plus: HiPlus,
  trash: HiTrash,
  lock: HiLockClosed,
  sun: HiSun,
  document: HiDocumentText,
  photo: HiPhoto,
  scissors: FaScissors,
  "drag-handle": RxDragHandleDots2,
};

export function Icon({
  name,
  icon: CustomIcon,
  size = "md",
  className,
  ...props
}: IconProps) {
  const ResolvedIcon = CustomIcon ?? (name ? ICON_MAP[name] : null);

  if (!ResolvedIcon) {
    return null;
  }

  return (
    <ResolvedIcon
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 transition-colors",
        name === "spinner" && "animate-spin",
        ICON_SIZE_STYLES[size],
        className
      )}
      {...props}
    />
  );
}

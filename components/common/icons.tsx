import type { ComponentPropsWithoutRef } from "react";
import {
  HiDocumentText,
  HiTrash,
  HiSquares2X2,
  HiArrowsPointingIn,
  HiPhoto,
  HiSun,
  HiLockClosed,
  HiPlus,
  HiArrowUp,
  HiArrowDown,
  HiArrowRight,
  HiInformationCircle,
  HiSparkles,
  HiHashtag,
  HiArrowDownTray,
  HiShieldCheck,
} from "react-icons/hi2";
import { FaScissors } from "react-icons/fa6";
import { RxDragHandleDots2 } from "react-icons/rx";

export function PdfLogoIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export const MergePdfIcon = HiDocumentText;
export const ScissorsIcon = FaScissors;
export const TrashIcon = HiTrash;
export const LayersIcon = HiSquares2X2;
export const CompressIcon = HiArrowsPointingIn;
export const ImageIcon = HiPhoto;
export const VinciAiIcon = HiSparkles;
export const SunIcon = HiSun;
export const LockIcon = HiLockClosed;
export const PlusIcon = HiPlus;
export const GripDotsIcon = RxDragHandleDots2;
export const ArrowUpIcon = HiArrowUp;
export const ArrowDownIcon = HiArrowDown;
export const ArrowRightIcon = HiArrowRight;
export const InfoIcon = HiInformationCircle;
export const ImagesToPdfIcon = HiPhoto;
export const PdfToImageIcon = HiArrowDownTray;
export const PageNumbersIcon = HiHashtag;
export const WatermarkIcon = HiShieldCheck;

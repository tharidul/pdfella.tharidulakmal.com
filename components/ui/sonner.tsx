"use client";

import { Toaster as Sonner, toast } from "sonner";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiExclamationTriangle,
  HiArrowPath,
} from "react-icons/hi2";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      richColors={false}
      closeButton
      duration={4000}
      icons={{
        success: <HiCheckCircle className="w-4 h-4 text-brand-primary shrink-0" />,
        error: <HiExclamationCircle className="w-4 h-4 text-brand-primary shrink-0" />,
        info: <HiInformationCircle className="w-4 h-4 text-brand-primary shrink-0" />,
        warning: <HiExclamationTriangle className="w-4 h-4 text-brand-primary shrink-0" />,
        loading: <HiArrowPath className="w-4 h-4 text-brand-primary animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200/90 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-xs py-3.5 px-4 group-[.toaster]:border",
          title: "font-semibold text-xs text-neutral-900 leading-snug",
          description: "group-[.toast]:text-neutral-600 text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-brand-primary group-[.toast]:text-white hover:group-[.toast]:bg-brand-primary-hover font-medium text-xs rounded-lg px-2.5 py-1 transition-colors cursor-pointer",
          cancelButton:
            "group-[.toast]:bg-brand-subtle group-[.toast]:text-brand-primary hover:group-[.toast]:bg-brand-border/40 text-xs rounded-lg px-2.5 py-1 transition-colors cursor-pointer",
          closeButton:
            "!bg-white !text-neutral-400 hover:!text-brand-primary hover:!bg-brand-subtle !border-neutral-200 !shadow-2xs cursor-pointer transition-colors",
          success:
            "group-[.toaster]:border-brand-border group-[.toaster]:bg-white",
          error:
            "group-[.toaster]:border-brand-border group-[.toaster]:bg-brand-subtle/40",
          info:
            "group-[.toaster]:border-neutral-200 group-[.toaster]:bg-white",
          warning:
            "group-[.toaster]:border-brand-border group-[.toaster]:bg-white",
        },
      }}
      style={
        {
          "--offset-top": "68px",
          "--offset-right": "24px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };

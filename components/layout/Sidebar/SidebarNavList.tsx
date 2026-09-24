"use client";

import Link from "next/link";
import { PRIMARY_TOOLS, type NavItem } from "./sidebarConfig";

export interface SidebarNavListProps {
  pathname: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
  isMobile?: boolean;
}

export function SidebarNavList({
  pathname,
  isCollapsed = false,
  onItemClick,
  isMobile = false,
}: SidebarNavListProps) {
  if (isMobile) {
    return (
      <nav aria-label="Mobile Tools Navigation" className="flex flex-col space-y-1">
        <span className="text-xs font-semibold text-neutral-500 px-3 mb-1">
          PDF Utilities
        </span>
        {PRIMARY_TOOLS.map((item: NavItem) => {
          const IconComponent = item.icon;
          const isActive =
            item.href === "/merge" || item.href === "/"
              ? pathname === "/" || pathname === "/merge"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={false}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? "bg-brand-subtle text-brand-primary font-semibold"
                  : "text-neutral-800 hover:bg-neutral-50 font-medium"
              }`}
            >
              <IconComponent className="w-5 h-5 text-brand-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm leading-snug">{item.name}</span>
                <span className="text-xs text-neutral-600 leading-none mt-0.5">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Tools Navigation" className="flex flex-col space-y-1">
      {PRIMARY_TOOLS.map((item: NavItem) => {
        const IconComponent = item.icon;
        const isActive =
          item.href === "/merge" || item.href === "/"
            ? pathname === "/" || pathname === "/merge"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (isActive) {
          return (
            <div
              key={item.id}
              title={item.name}
              className="relative flex items-center px-5 py-3 bg-brand-subtle rounded-r-xl transition-colors duration-200 cursor-pointer"
            >
              <div className="absolute left-0 top-1 bottom-1 w-1 bg-brand-primary rounded-r" />
              <div className="w-10 h-6 flex items-center justify-center shrink-0">
                <IconComponent className="w-5 h-5 text-brand-primary" />
              </div>
              <div
                className={`flex flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                  isCollapsed
                    ? "max-w-0 opacity-0 pointer-events-none"
                    : "max-w-[170px] opacity-100 ml-2"
                }`}
              >
                <span className="text-sm font-semibold text-brand-primary leading-snug">
                  {item.name}
                </span>
                <span className="text-xs text-neutral-600 leading-none mt-0.5">
                  {item.description}
                </span>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            prefetch={false}
            title={item.name}
            className="relative flex items-center px-5 py-3 text-neutral-800 hover:bg-neutral-50 rounded-r-xl transition-colors duration-200 cursor-pointer"
          >
            <div className="w-10 h-6 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 text-brand-primary" />
            </div>
            <div
              className={`flex flex-col overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed
                  ? "max-w-0 opacity-0 pointer-events-none"
                  : "max-w-[170px] opacity-100 ml-2"
              }`}
            >
              <span className="text-sm font-medium leading-snug">{item.name}</span>
              <span className="text-xs text-neutral-600 leading-none mt-0.5">
                {item.description}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

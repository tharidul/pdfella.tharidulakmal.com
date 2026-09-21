"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

function LuChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LuCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
}

export interface SelectProps {
  readonly id?: string;
  readonly name?: string;
  readonly options: readonly SelectOption[];
  readonly value?: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly dropdownClassName?: string;
  readonly footerAction?: ReactNode;
  readonly emptyMessage?: string;
}

export function Select({
  id,
  name,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  error,
  className,
  triggerClassName,
  dropdownClassName,
  footerAction,
  emptyMessage = "No options available",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const reactId = useId();
  const selectId = id ?? `select-${reactId}`;
  const listboxId = `listbox-${selectId}`;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      highlightedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const openDropdown = () => {
    if (disabled) return;
    const idx = options.findIndex((opt) => opt.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        break;
      case "Tab":
        closeDropdown();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (opt) {
            handleSelect(opt.value);
          }
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {name && (
        <input type="hidden" name={name} value={value ?? ""} />
      )}

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all outline-hidden cursor-pointer select-none",
          "dark:bg-neutral-800",
          error
            ? "border-rich-mahogany ring-2 ring-rich-mahogany/20"
            : isOpen
            ? "border-ebony ring-2 ring-ebony/20 dark:border-soft-fawn dark:ring-soft-fawn/20"
            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700",
          disabled && "cursor-not-allowed opacity-50 bg-neutral-100 dark:bg-neutral-900",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "truncate block",
            selectedOption
              ? "font-medium text-neutral-900 dark:text-neutral-100"
              : "text-neutral-400 dark:text-neutral-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <LuChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-500 ml-2",
            isOpen && "rotate-180 text-ebony dark:text-soft-fawn"
          )}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-md backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-800/95",
            dropdownClassName
          )}
        >
          <div ref={listRef} className="max-h-60 overflow-y-auto space-y-0.5">
            {options.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {emptyMessage}
              </div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors cursor-pointer select-none",
                      isSelected
                        ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-700/90 dark:text-white"
                        : isHighlighted
                        ? "bg-neutral-100/70 text-neutral-900 dark:bg-neutral-700/50 dark:text-neutral-100"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/40"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] font-normal text-neutral-400 dark:text-neutral-400 truncate mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <LuCheck className="h-4 w-4 shrink-0 text-ebony dark:text-soft-fawn" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {footerAction && (
            <div className="mt-1 border-t border-neutral-100 pt-1 dark:border-neutral-700/60">
              {footerAction}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-rich-mahogany dark:text-soft-fawn font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

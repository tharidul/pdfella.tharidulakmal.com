"use client";

import { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export interface ComboboxOption {
  readonly value: string;
  readonly label?: string;
  readonly category?: string;
}

export interface ComboboxProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly (string | ComboboxOption)[];
  readonly placeholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();
  const inputId = id ?? `combobox-${reactId}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Normalize options into { value, label, category }
  const normalizedOptions: ComboboxOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // Filter options based on user input
  const query = value.trim().toLowerCase();
  const filteredOptions = query
    ? normalizedOptions.filter((opt) => {
        const valMatch = opt.value.toLowerCase().includes(query);
        const labelMatch = opt.label?.toLowerCase().includes(query);
        return valMatch || labelMatch;
      })
    : normalizedOptions;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full text-xs sm:text-sm rounded-xl border border-neutral-200 px-3.5 py-2.5 pr-9 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-[border-color,box-shadow] duration-150 ease-out bg-white"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        >
          <ChevronDownIcon
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180 text-brand-primary"
            )}
          />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1 text-xs sm:text-sm">
          {filteredOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onMouseDown={(e) => {
                  // prevent blur before click
                  e.preventDefault();
                }}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-neutral-800",
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary font-medium"
                    : "hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <span className="truncate">{opt.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

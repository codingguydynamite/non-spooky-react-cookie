"use client";

import type * as React from "react";
import { useId, useState } from "react";
import type {
  ButtonLikeProps,
  CollapsibleProps,
  SwitchLikeProps,
} from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Default Button.
 * Colors come from the `--nsr-*` variables: defaults in `styles.css`,
 * overrides from the provider's `theme` prop.
 */
export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonLikeProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--nsr-primary)] text-[var(--nsr-primary-text)] hover:bg-cyan-400",
        variant === "secondary" &&
          "border border-[var(--nsr-border)] bg-[var(--nsr-secondary)] text-[var(--nsr-secondary-text)] hover:bg-zinc-50 dark:hover:bg-zinc-900",
        variant === "ghost" &&
          "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Default Switch.
 * The "on" color follows the theme's primary color.
 */
export function Switch({
  checked,
  disabled,
  onCheckedChange,
  "aria-label": ariaLabel,
}: Readonly<SwitchLikeProps>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-[var(--nsr-primary)]" : "bg-zinc-300 dark:bg-zinc-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

/**
 * Default Collapsible.
 * A disclosure that hides its children until the trigger is pressed.
 * Works controlled (`open` + `onOpenChange`) or self-managed (`defaultOpen`).
 * The chevron follows the theme's primary color.
 */
export function Collapsible({
  children,
  count,
  label,
  open,
  onOpenChange,
  defaultOpen,
  className,
  contentClassName,
}: Readonly<CollapsibleProps>) {
  const regionId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? internalOpen;

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div>
      <button
        type="button"
        aria-controls={regionId}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2",
          className,
        )}
        onClick={toggle}
      >
        <span className="text-xs font-semibold text-[var(--nsr-primary)]">
          {count} {label}
        </span>
        <svg
          className={cn(
            "h-6 w-6 shrink-0 text-[var(--nsr-primary)] transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen ? (
        <div className={contentClassName} id={regionId}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

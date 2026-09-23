"use client";

import { useId, useState } from "react";
import type { ButtonLikeProps, CollapsibleProps, SwitchLikeProps } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Default Button.
 * Colors come from the `--nsr-*` variables: defaults in `styles.css`,
 * overrides from the provider's `theme` prop.
 */
export function Button({ className, variant = "secondary", ...props }: ButtonLikeProps) {
  return (
    <button
      className={cn("nsr-button", `nsr-button--${variant}`, className)}
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
      className="nsr-switch"
    >
      <span className="nsr-switch__thumb" />
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
    <div className={cn("nsr-collapsible", isOpen && "nsr-collapsible--open")}>
      <button
        type="button"
        aria-controls={regionId}
        aria-expanded={isOpen}
        className={cn("nsr-collapsible__trigger", className)}
        onClick={toggle}
      >
        <span className="nsr-collapsible__label">
          {label} ({count})
        </span>
        <svg
          className="nsr-collapsible__chevron"
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
        <div className={cn("nsr-collapsible__content", contentClassName)} id={regionId}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

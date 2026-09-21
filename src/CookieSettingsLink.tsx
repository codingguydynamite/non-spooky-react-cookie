"use client";

import { usePreferences } from "./hooks/usePreferences";
import type { CookieSettingsLinkProps } from "./types";
import { cn } from "./ui";

/**
 * A small link (e.g. in a footer) that opens the cookie settings dialog.
 * Renders your children, or the built-in "Cookie settings" text.
 */
export function CookieSettingsLink({
  children,
  className,
  type = "button",
  onClick,
  ...props
}: Readonly<CookieSettingsLinkProps>) {
  const { openSettings, texts } = usePreferences();

  return (
    <button
      className={cn("nsr-settings-link", className)}
      onClick={(event) => {
        // Open the dialog first, then let the consumer's handler run — the
        // spread below must not be able to silently override the built-in.
        openSettings();
        onClick?.(event);
      }}
      type={type}
      {...props}
    >
      {children ?? texts.footerLink}
    </button>
  );
}

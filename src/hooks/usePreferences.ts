"use client";

import { useContext } from "react";
import { CookieBannerContext } from "../CookieBannerConfigurationProvider";

/**
 * Access the cookie banner state and actions from anywhere
 * inside a CookieBannerConfigurationProvider.
 */
export function usePreferences() {
  const context = useContext(CookieBannerContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used within a CookieBannerConfigurationProvider",
    );
  }

  return context;
}

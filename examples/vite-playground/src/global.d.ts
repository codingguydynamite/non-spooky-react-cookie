declare global {
  interface Window {
    /** Registered automatically by every CookieBannerConfigurationProvider. */
    justDont?: () => void;
  }
}

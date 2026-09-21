import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  CookieSettingsLink,
} from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";

/**
 * The smallest possible setup. No config: the provider falls back to the
 * built-in categories (necessary / preferences / analytics / marketing) and
 * English texts. `policyUrl` is optional; without it no link is rendered.
 */
export function BasicBannerWithDefaults() {
  return (
    <CookieBannerConfigurationProvider storageKey="pg-basic">
      <div className="pg-card">
        <h3>What to try</h3>
        <p>
          Accept, reject, or open the settings from the banner at the bottom. Then use{" "}
          <em>Reset decision</em> below to bring it back. The footer link opens the same
          dialog from anywhere in your app.
        </p>
      </div>

      <ConsentToolbar />

      <footer className="pg-footer">
        <span>© Example Inc.</span>
        <a href="#/basic">Imprint</a>
        <CookieSettingsLink />
      </footer>

      <CookieBanner policyUrl="#/basic" />
    </CookieBannerConfigurationProvider>
  );
}

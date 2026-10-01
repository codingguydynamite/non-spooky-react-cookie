import type { ConsentConfig } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
import type { CSSProperties } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

/**
 * Iframes are not <script> tags, so the provider's `scripts` map does not
 * manage them. The gate is plain React: `isAllowed(item)` decides whether the
 * <iframe> mounts at all. Each item below is accepted independently.
 */
const config: ConsentConfig = {
  categories: {
    necessary: { required: true, name: "Necessary" },
    "external-media": {
      name: "External media",
      description: "Embedded videos and maps.",
      items: {
        youtube: { name: "YouTube", description: "Plays embedded videos." },
        "google-maps": { name: "Google Maps", description: "Shows embedded maps." },
      },
    },
  },
};

const VIDEO_ID = "5NPBIwQyPWE";

/** Same footprint as the iframe that replaces the placeholder. */
const mediaFrame: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  border: "none",
  borderRadius: "0.75rem",
};

/**
 * Gray, centered stand-in with the exact size of the media that replaces it.
 * No thumbnail, no play button — the consent decision is the only trigger.
 */
function MediaPlaceholder({
  text,
  onOpenSettings,
}: {
  text: string;
  onOpenSettings: () => void;
}) {
  return (
    <div
      style={{
        ...mediaFrame,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        border: "1px dashed #d4d4d8",
        background: "#f4f4f5",
        padding: "0.75rem",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "#52525b",
      }}
    >
      <span>{text}</span>
      <button className="pg-btn" type="button" onClick={onOpenSettings}>
        Manage consent
      </button>
    </div>
  );
}

function YouTubeWidget() {
  const { isAllowed, openSettings } = usePreferences();

  if (!isAllowed("youtube")) {
    return (
      <MediaPlaceholder
        text="This video is hosted on YouTube. Accept the YouTube consent to watch it."
        onOpenSettings={openSettings}
      />
    );
  }

  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
      title="YouTube video"
      allowFullScreen
      style={mediaFrame}
    />
  );
}

function MapsWidget() {
  const { isAllowed, openSettings } = usePreferences();

  if (!isAllowed("google-maps")) {
    return (
      <MediaPlaceholder
        text="This map is provided by Google Maps. Accept the Google Maps consent to see it."
        onOpenSettings={openSettings}
      />
    );
  }

  return (
    <iframe
      src="https://www.google.com/maps?q=New%20York&output=embed"
      title="Map of New York"
      style={mediaFrame}
    />
  );
}

export function ExternalMedia() {
  const respectGpc = useRespectGpc();
  return (
    <CookieBannerConfigurationProvider
      respectGlobalPrivacyControl={respectGpc}
      storageKey="pg-external-media"
      config={config}
    >
      <div className="pg-card">
        <h3>External media, gated per item</h3>
        <p className="pg-muted">
          The iframes below are not in the DOM until you accept the matching item under{" "}
          <strong>External media</strong>. Accepting one item does not unlock the other.
        </p>
        <div className="pg-grid">
          <YouTubeWidget />
          <MapsWidget />
        </div>
        <p className="pg-muted">
          Withdraw an item in the settings and its &lt;iframe&gt; disappears from the DOM
          — check the Elements panel.
        </p>
      </div>
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}

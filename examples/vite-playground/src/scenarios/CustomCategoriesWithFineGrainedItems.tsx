import type { ConsentConfig } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  usePreferences,
} from "non-spooky-react-cookie";
import { ConsentToolbar } from "../components/ConsentToolbar";

/**
 * Categories are groups; items are fine-grained entries inside a group.
 * An item is accepted on its own: "Meta Pixel" can be on while the
 * Marketing master switch is off. The master switch is a convenience that
 * toggles all of its items at once.
 */
const config: ConsentConfig = {
  categories: {
    necessary: { required: true, name: "Necessary" },
    functional: {
      name: "Functional",
      description: "Embedded maps and videos.",
      items: {
        "google-maps": { name: "Google Maps", description: "Shows our locations." },
        youtube: { name: "YouTube", description: "Plays embedded videos." },
      },
    },
    marketing: {
      name: "Marketing",
      description: "Pixels and conversion tracking. Pick individual services below.",
      items: {
        "meta-pixel": { name: "Meta Pixel", description: "Facebook & Instagram ads." },
        "google-ads": { name: "Google Ads", description: "Remarketing campaigns." },
      },
    },
  },
};

function Gates() {
  const { isAllowed } = usePreferences();
  const ids = [
    "functional",
    "google-maps",
    "youtube",
    "marketing",
    "meta-pixel",
    "google-ads",
  ];

  return (
    <div className="pg-card">
      <h3>isAllowed(id)</h3>
      <p className="pg-muted">
        Open the settings, expand the categories, and toggle a single item. The item flips
        without its parent.
      </p>
      <div className="pg-row pg-row--wrap">
        {ids.map((id) => (
          <span
            key={id}
            className={isAllowed(id) ? "pg-chip pg-chip--on" : "pg-chip pg-chip--off"}
          >
            {id}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CustomCategoriesWithFineGrainedItems() {
  return (
    <CookieBannerConfigurationProvider storageKey="pg-categories" config={config}>
      <Gates />
      <ConsentToolbar />
      <CookieBanner />
    </CookieBannerConfigurationProvider>
  );
}

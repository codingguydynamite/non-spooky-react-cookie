import type { Texts } from "../types";

export const en: Texts = {
  banner: {
    title: "Privacy preferences",
    description:
      "We use necessary technologies to run this website. Optional analytics, marketing, and preference services are loaded only after your consent.",
    acceptAll: "Accept all",
    rejectAll: "Reject optional",
    settings: "Settings",
    policyLink: "Privacy policy",
  },
  dialog: {
    title: "Cookie settings",
    description:
      "Choose which optional categories you want to allow. Necessary technologies are required for the website to work.",
    save: "Save selection",
    close: "Close",
    itemsLabel: "Services",
  },
  footerLink: "Cookie settings",
  categories: {
    necessary: {
      title: "Necessary",
      description:
        "Required for website operation and for saving your privacy settings. This category cannot be disabled.",
    },
    preferences: {
      title: "Preferences",
      description:
        "Stores optional settings such as appearance or language when the website provides those features.",
    },
    analytics: {
      title: "Analytics",
      description:
        "Helps us understand how the website is used so we can improve content and performance.",
    },
    marketing: {
      title: "Marketing",
      description:
        "Allows marketing and advertising services such as pixels or conversion tracking. Active only when such integrations are added.",
    },
  },
};

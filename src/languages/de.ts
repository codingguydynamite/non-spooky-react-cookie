import type { Texts } from "../types";

export const de: Texts = {
  banner: {
    title: "Datenschutzeinstellungen",
    description:
      "Wir verwenden notwendige Technologien für den Betrieb der Website. Optionale Dienste für Analyse, Marketing und Präferenzen werden erst nach Ihrer Einwilligung geladen.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Optionale ablehnen",
    settings: "Einstellungen",
    policyLink: "Datenschutzerklärung",
  },
  dialog: {
    title: "Cookie-Einstellungen",
    description:
      "Wählen Sie aus, welche optionalen Kategorien Sie erlauben möchten. Notwendige Technologien sind für den Betrieb der Website erforderlich.",
    save: "Auswahl speichern",
    close: "Schließen",
    itemsLabel: (count) => (count === 1 ? "Dienst" : "Dienste"),
  },
  footerLink: "Cookie-Einstellungen",
  categories: {
    necessary: {
      title: "Notwendig",
      description:
        "Erforderlich für den Betrieb der Website und das Speichern Ihrer Datenschutzeinstellungen. Diese Kategorie kann nicht deaktiviert werden.",
    },
    preferences: {
      title: "Präferenzen",
      description:
        "Speichert optionale Einstellungen wie Darstellung oder Sprache, wenn die Website solche Funktionen nutzt.",
    },
    analytics: {
      title: "Analyse",
      description:
        "Hilft uns zu verstehen, wie die Website genutzt wird, damit wir Inhalte und Performance verbessern können.",
    },
    marketing: {
      title: "Marketing",
      description:
        "Erlaubt Marketing- und Werbedienste wie Pixel oder Conversion-Tracking. Derzeit nur aktiv, wenn entsprechende Integrationen eingebunden werden.",
    },
  },
};

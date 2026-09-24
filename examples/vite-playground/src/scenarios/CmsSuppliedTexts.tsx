import type { ConsentConfig, TextOverrides } from "non-spooky-react-cookie";
import {
  CookieBanner,
  CookieBannerConfigurationProvider,
  CookieSettingsLink,
} from "non-spooky-react-cookie";
import { useState } from "react";
import { ConsentToolbar } from "../components/ConsentToolbar";
import { useRespectGpc } from "../components/gpc-settings";

/**
 * What a CMS hands back, one document per locale: plain JSON, with `null`
 * wherever an editor left a field blank. Each `null` keeps the built-in text.
 * Arabic has no built-in texts, so its blanks fall back to English.
 */
const cmsDocuments: Record<"pl" | "de" | "ar", TextOverrides> = {
  pl: {
    banner: {
      title: null,
      description: "Tekst wpisany w panelu administracyjnym.",
      acceptAll: null,
    },
    dialog: {
      title: null,
      itemsLabel: "Pokaż narzędzia",
    },
    categories: { marketing: { title: null, description: null } },
  },
  de: {
    banner: { title: "Datenschutz (aus dem CMS)", description: null },
    dialog: { itemsLabel: null },
    categories: null,
  },
  ar: {
    banner: {
      title: "إعدادات الخصوصية",
      description: "نستخدم تقنيات ضرورية لتشغيل هذا الموقع.",
      acceptAll: "قبول الكل",
      rejectAll: "رفض الاختياري",
      settings: "الإعدادات",
      policyLink: null,
    },
    dialog: {
      title: "إعدادات ملفات تعريف الارتباط",
      save: "حفظ",
      close: "إغلاق",
      itemsLabel: "عرض الأدوات",
    },
  },
};

const config: ConsentConfig = {
  categories: {
    necessary: { required: true },
    analytics: { items: { plausible: { name: "Plausible" } } },
    preferences: {
      items: {
        theme: { name: "Theme" },
        locale: { name: "Locale" },
        layout: { name: "Layout" },
      },
    },
    marketing: {
      items: {
        "meta-pixel": { name: "Meta Pixel" },
        "google-ads": { name: "Google Ads" },
        linkedin: { name: "LinkedIn Insight" },
        hubspot: { name: "HubSpot" },
        clarity: { name: "Clarity" },
      },
    },
  },
};

const languages = ["pl", "de", "ar"] as const;

export function CmsSuppliedTexts() {
  const respectGpc = useRespectGpc();
  const [language, setLanguage] = useState<(typeof languages)[number]>("pl");
  const [useCms, setUseCms] = useState(true);
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir}>
      <CookieBannerConfigurationProvider
        respectGlobalPrivacyControl={respectGpc}
        storageKey="pg-cms-texts"
        config={config}
        language={language}
        texts={useCms ? cmsDocuments[language] : undefined}
      >
        <div className="pg-card">
          <div className="pg-row pg-row--wrap">
            <span className="pg-label" style={{ margin: 0 }}>
              language=
            </span>
            {languages.map((code) => (
              <button
                key={code}
                className={language === code ? "pg-btn pg-btn--primary" : "pg-btn"}
                type="button"
                onClick={() => setLanguage(code)}
              >
                {code}
              </button>
            ))}
            <span className="pg-spacer" />
            <label className="pg-row" style={{ cursor: "pointer" }}>
              <input
                name="use-cms-texts"
                type="checkbox"
                checked={useCms}
                onChange={(e) => setUseCms(e.target.checked)}
              />
              apply the CMS document
            </label>
          </div>
          <p className="pg-muted">
            Every <code>null</code> keeps the built-in text. <code>ar</code> renders under{" "}
            <code>dir="rtl"</code>, so a switched-on toggle sits on the left.
          </p>
          <pre className="pg-muted" style={{ overflowX: "auto" }}>
            {JSON.stringify(cmsDocuments[language], null, 2)}
          </pre>
        </div>

        <ConsentToolbar />

        <footer className="pg-footer">
          <CookieSettingsLink />
        </footer>

        <CookieBanner policyUrl="#/cms-texts" />
      </CookieBannerConfigurationProvider>
    </div>
  );
}

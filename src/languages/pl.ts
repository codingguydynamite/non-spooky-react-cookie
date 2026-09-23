import type { Texts } from "../types";

/** 1 usługa, 2-4 / 22-24 usługi, 0 / 5-21 / 25 usług. */
function polishServices(count: number): string {
  if (count === 1) return "Usługa";
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "Usługi";
  return "Usług";
}

export const pl: Texts = {
  banner: {
    title: "Ustawienia prywatności",
    description:
      "Używamy technologii niezbędnych do działania strony. Opcjonalne usługi analityczne, marketingowe i preferencje uruchamiamy dopiero po Twojej zgodzie.",
    acceptAll: "Akceptuj wszystkie",
    rejectAll: "Odrzuć opcjonalne",
    settings: "Ustawienia",
    policyLink: "Polityka prywatności",
  },
  dialog: {
    title: "Ustawienia cookies",
    description:
      "Wybierz, które opcjonalne kategorie chcesz włączyć. Technologie niezbędne są wymagane do działania strony.",
    save: "Zapisz wybór",
    close: "Zamknij",
    itemsLabel: polishServices,
  },
  footerLink: "Ustawienia cookies",
  categories: {
    necessary: {
      title: "Niezbędne",
      description:
        "Wymagane do działania strony i zapisania ustawień prywatności. Tej kategorii nie można wyłączyć.",
    },
    preferences: {
      title: "Preferencje",
      description:
        "Zapisuje opcjonalne ustawienia, takie jak wygląd lub język, jeśli strona korzysta z takich funkcji.",
    },
    analytics: {
      title: "Analityka",
      description:
        "Pomaga zrozumieć, jak używana jest strona, aby poprawiać treści i wydajność.",
    },
    marketing: {
      title: "Marketing",
      description:
        "Pozwala na usługi marketingowe i reklamowe, takie jak piksele lub śledzenie konwersji. Aktywne tylko po dodaniu takich integracji.",
    },
  },
};

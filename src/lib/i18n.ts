import type { LocaleName, ThemeName } from "./types";

export interface UIStrings {
  skipToContent: string;
  title: string;
  company: string;
  subtitle: string;
  documentTitle: string;
  theme: string;
  language: string;
  localeEn: string;
  localeDe: string;
  themeLabel: Record<ThemeName, string>;
  animatedBackground: string;
  animatedBackgroundReduced: string;
  comingSoonHeading: string;
  comingSoonBody: string;
  fictionalNote: string;
}

export const COMPANY = "CloudBox";

export const STRINGS: Record<LocaleName, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    title: "CloudBox Storage",
    company: COMPANY,
    subtitle: "A fictional cloud storage subscription checkout.",
    documentTitle: "CloudBox Storage",
    theme: "Theme",
    language: "Language",
    localeEn: "EN",
    localeDe: "DE",
    themeLabel: { khaki: "Khaki", graphite: "Graphite", midnight: "Midnight" },
    animatedBackground: "Animated background",
    animatedBackgroundReduced: "Animated background (reduced motion is on)",
    comingSoonHeading: "Plan selection is next",
    comingSoonBody:
      "This is the app shell: themes, motion and language. Choosing a storage plan and checking out will land in the following updates.",
    fictionalNote: "CloudBox Storage is a fictional product. This is not a real checkout and no payment is taken.",
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    title: "CloudBox Storage",
    company: COMPANY,
    subtitle: "Ein fiktiver Checkout für ein Cloud-Speicher-Abo.",
    documentTitle: "CloudBox Storage",
    theme: "Thema",
    language: "Sprache",
    localeEn: "EN",
    localeDe: "DE",
    themeLabel: { khaki: "Khaki", graphite: "Graphit", midnight: "Mitternacht" },
    animatedBackground: "Animierter Hintergrund",
    animatedBackgroundReduced: "Animierter Hintergrund (reduzierte Bewegung ist aktiv)",
    comingSoonHeading: "Als Nächstes kommt die Planauswahl",
    comingSoonBody:
      "Das ist die App-Hülle: Themes, Bewegung und Sprache. Die Auswahl eines Speicherplans und der Checkout folgen in den nächsten Schritten.",
    fictionalNote: "CloudBox Storage ist ein fiktives Produkt. Dies ist kein echter Checkout und es wird keine Zahlung ausgeführt.",
  },
};

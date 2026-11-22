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
  planHeading: string;
  planIntro: string;
  durationLegend: string;
  durationLabel: (months: number) => string;
  storageLegend: string;
  storageLabel: (gb: number) => string;
  upfrontLegend: string;
  upfrontLabel: string;
  priceHeading: string;
  priceMonthly: string;
  priceDuration: string;
  priceSubtotal: string;
  priceDiscount: string;
  priceTotal: string;
  priceLive: string;
  continue: string;
  back: string;
  detailsHeading: string;
  detailsIntro: string;
  nameLabel: string;
  emailLabel: string;
  termsLabel: string;
  nameError: string;
  emailError: string;
  termsError: string;
  detailsSaved: string;
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
    planHeading: "Choose your plan",
    planIntro: "Pick a term, a storage size and whether to pay the full term up front for 10% off.",
    durationLegend: "Duration",
    durationLabel: (months) => (months === 1 ? "1 month" : `${months} months`),
    storageLegend: "Storage",
    storageLabel: (gb) => `${gb} GB`,
    upfrontLegend: "Payment",
    upfrontLabel: "Pay the full term now and save 10%",
    priceHeading: "Price summary",
    priceMonthly: "Monthly rate",
    priceDuration: "Term",
    priceSubtotal: "Subtotal",
    priceDiscount: "Upfront discount",
    priceTotal: "Total",
    priceLive: "Live price summary",
    continue: "Continue",
    back: "Back",
    detailsHeading: "Your details",
    detailsIntro: "We only use these in this browser for the demo checkout. Nothing is sent to a server.",
    nameLabel: "Full name",
    emailLabel: "Email",
    termsLabel: "I agree to the fictional terms of this demo",
    nameError: "Enter your name.",
    emailError: "Enter a valid email address.",
    termsError: "Please agree to the terms to continue.",
    detailsSaved: "Your details look good. The next step comes after this.",
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
    planHeading: "Wählen Sie Ihren Plan",
    planIntro: "Wählen Sie die Laufzeit, die Speichergröße und ob Sie die gesamte Laufzeit im Voraus mit 10 % Rabatt zahlen.",
    durationLegend: "Laufzeit",
    durationLabel: (months) => (months === 1 ? "1 Monat" : `${months} Monate`),
    storageLegend: "Speicher",
    storageLabel: (gb) => `${gb} GB`,
    upfrontLegend: "Zahlung",
    upfrontLabel: "Die volle Laufzeit jetzt zahlen und 10 % sparen",
    priceHeading: "Preisübersicht",
    priceMonthly: "Monatlicher Preis",
    priceDuration: "Laufzeit",
    priceSubtotal: "Zwischensumme",
    priceDiscount: "Vorauszahlungsrabatt",
    priceTotal: "Gesamt",
    priceLive: "Aktuelle Preisübersicht",
    continue: "Weiter",
    back: "Zurück",
    detailsHeading: "Ihre Angaben",
    detailsIntro: "Diese Angaben bleiben für den Demo-Checkout in diesem Browser. Es wird nichts an einen Server gesendet.",
    nameLabel: "Vollständiger Name",
    emailLabel: "E-Mail",
    termsLabel: "Ich stimme den fiktiven Bedingungen dieser Demo zu",
    nameError: "Bitte geben Sie Ihren Namen ein.",
    emailError: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    termsError: "Bitte stimmen Sie den Bedingungen zu, um fortzufahren.",
    detailsSaved: "Ihre Angaben sehen gut aus. Der nächste Schritt folgt danach.",
  },
};

import { useEffect, useState } from "react";
import { ConfirmStep } from "./components/ConfirmStep";
import { DetailsStep } from "./components/DetailsStep";
import { PaymentStep } from "./components/PaymentStep";
import { PlanStep } from "./components/PlanStep";
import { Progress } from "./components/Progress";
import type { DetailsDraft } from "./domain/details";
import type { PlanConfig } from "./domain/pricing";
import { useStoredState } from "./hooks/useStoredState";
import { STRINGS } from "./lib/i18n";
import {
  KEYS,
  defaultLocale,
  defaultMotion,
  defaultTheme,
  localeSchema,
  motionSchema,
  themeSchema,
} from "./lib/storage";
import type { LocaleName, MotionName, ThemeName } from "./lib/types";
import {
  ensureOrderNumber,
  normalizeWizard,
  parseStepParam,
  readWizard,
  searchWithStep,
  writeWizard,
  type WizardState,
  type WizardStep,
} from "./lib/wizard";
import { LocaleToggle } from "./theme/LocaleToggle";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

function loadInitialWizard(now: Date): WizardState {
  const stored = readWizard();
  const urlStep = parseStepParam(window.location.search);
  const merged = normalizeWizard(urlStep ? { ...stored, step: urlStep } : stored);
  return ensureOrderNumber(merged, now);
}

function syncUrl(step: WizardStep, mode: "push" | "replace") {
  const url = `${window.location.pathname}${searchWithStep(step, window.location.search)}${window.location.hash}`;
  if (mode === "push") window.history.pushState({ step }, "", url);
  else window.history.replaceState({ step }, "", url);
}

interface AppProps {
  now?: Date;
  paymentDelayMs?: number;
}

export function App({ now, paymentDelayMs = 600 }: AppProps) {
  const [theme, setTheme] = useStoredState<ThemeName>(KEYS.theme, themeSchema, defaultTheme());
  const [motion, setMotion] = useStoredState<MotionName>(
    KEYS.motion,
    motionSchema,
    defaultMotion(),
  );
  const [locale, setLocale] = useStoredState<LocaleName>(
    KEYS.locale,
    localeSchema,
    defaultLocale(),
  );
  const clock = now ?? new Date();
  const [wizard, setWizard] = useState<WizardState>(() => loadInitialWizard(clock));
  const reducedMotion = prefersReducedMotion();
  const strings = STRINGS[locale];

  function commit(next: WizardState, historyMode: "push" | "replace" | "none") {
    const resolved = ensureOrderNumber(normalizeWizard(next), clock);
    writeWizard(resolved);
    if (historyMode !== "none") syncUrl(resolved.step, historyMode);
    setWizard(resolved);
    return resolved;
  }

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = strings.documentTitle;
  }, [locale, strings.documentTitle]);

  useEffect(() => {
    writeWizard(wizard);
    syncUrl(wizard.step, "replace");
    function onPop() {
      const step = parseStepParam(window.location.search);
      setWizard((current) => {
        const next = normalizeWizard(step ? { ...current, step } : current);
        writeWizard(next);
        return next;
      });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // Hydrate the URL once; later step changes use commit().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setPlan(plan: PlanConfig) {
    commit({ ...wizard, plan }, "replace");
  }

  function setDetails(details: DetailsDraft) {
    commit({ ...wizard, details }, "replace");
  }

  function go(step: WizardStep) {
    commit({ ...wizard, step }, "push");
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {strings.skipToContent}
      </a>
      <header className="app-header">
        <div>
          <h1 className="app-title">{strings.title}</h1>
          <p className="app-sub">
            {strings.company} · {strings.subtitle}
          </p>
        </div>
        <div className="theme-tools">
          <LocaleToggle value={locale} onChange={setLocale} strings={strings} />
          <ThemeSwitcher value={theme} onChange={setTheme} strings={strings} />
          <MotionToggle
            value={motion}
            onChange={setMotion}
            reducedMotion={reducedMotion}
            strings={strings}
          />
        </div>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Progress step={wizard.step} strings={strings} />
        {wizard.step === "plan" && (
          <PlanStep
            plan={wizard.plan}
            onChange={setPlan}
            strings={strings}
            locale={locale}
            onContinue={() => go("details")}
          />
        )}
        {wizard.step === "details" && (
          <DetailsStep
            details={wizard.details}
            onChange={setDetails}
            onBack={() => go("plan")}
            onContinue={() => go("payment")}
            strings={strings}
          />
        )}
        {wizard.step === "payment" && (
          <PaymentStep
            onBack={() => go("details")}
            onSuccess={() => commit({ ...wizard, paymentCompleted: true, step: "confirm" }, "push")}
            strings={strings}
            now={clock}
            delayMs={paymentDelayMs}
          />
        )}
        {wizard.step === "confirm" && wizard.orderNumber && (
          <ConfirmStep
            plan={wizard.plan}
            details={wizard.details}
            orderNumber={wizard.orderNumber}
            onBack={() => go("payment")}
            strings={strings}
            locale={locale}
          />
        )}
      </main>
    </div>
  );
}

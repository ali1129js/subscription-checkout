import { useEffect, useState } from "react";
import { PlanStep } from "./components/PlanStep";
import { DEFAULT_PLAN } from "./domain/plan";
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
import { LocaleToggle } from "./theme/LocaleToggle";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

export function App() {
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
  const [plan, setPlan] = useState<PlanConfig>(DEFAULT_PLAN);
  const reducedMotion = prefersReducedMotion();
  const strings = STRINGS[locale];

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = strings.documentTitle;
  }, [locale, strings.documentTitle]);

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
        <PlanStep plan={plan} onChange={setPlan} strings={strings} locale={locale} />
      </main>
    </div>
  );
}

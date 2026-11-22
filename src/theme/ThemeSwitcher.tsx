import { THEME_NAMES } from "../lib/types";
import type { ThemeName } from "../lib/types";
import type { UIStrings } from "../lib/i18n";

interface Props {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
  strings: UIStrings;
}

export function ThemeSwitcher({ value, onChange, strings }: Props) {
  return (
    <div role="group" aria-label={strings.theme} className="segmented wrap">
      {THEME_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={value === name}
          onClick={() => onChange(name)}
          className="segment"
        >
          {strings.themeLabel[name]}
        </button>
      ))}
    </div>
  );
}

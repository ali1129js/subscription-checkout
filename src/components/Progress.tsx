import type { UIStrings } from "../lib/i18n";
import { STEPS, type WizardStep } from "../lib/wizard";

interface Props {
  step: WizardStep;
  strings: UIStrings;
}

export function Progress({ step, strings }: Props) {
  const labels = {
    plan: strings.stepPlan,
    details: strings.stepDetails,
    confirm: strings.stepConfirm,
  };
  const currentIndex = STEPS.indexOf(step);
  return (
    <nav className="progress" aria-label={strings.progressLabel}>
      <p className="sr-only">
        {strings.progressStep(currentIndex + 1, STEPS.length, labels[step])}
      </p>
      <ol>
        {STEPS.map((item, index) => (
          <li key={item} aria-current={item === step ? "step" : undefined}>
            <span className="progress-index">{index + 1}</span>
            {labels[item]}
          </li>
        ))}
      </ol>
    </nav>
  );
}

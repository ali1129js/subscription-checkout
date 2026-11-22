import { DURATIONS, STORAGE_GB, formatCents, pricePlan, type PlanConfig } from "../domain/pricing";
import type { LocaleName } from "../lib/types";
import type { UIStrings } from "../lib/i18n";

interface Props {
  plan: PlanConfig;
  onChange: (plan: PlanConfig) => void;
  strings: UIStrings;
  locale: LocaleName;
  onContinue: () => void;
}

export function PlanStep({ plan, onChange, strings, locale, onContinue }: Props) {
  const price = pricePlan(plan);
  return (
    <section className="panel plan-step" aria-labelledby="plan-heading">
      <h2 id="plan-heading">{strings.planHeading}</h2>
      <p>{strings.planIntro}</p>
      <fieldset className="plan-fieldset">
        <legend>{strings.durationLegend}</legend>
        <div className="plan-options">
          {DURATIONS.map((months) => {
            const id = `duration-${months}`;
            return (
              <label key={months} className="plan-option" htmlFor={id}>
                <input
                  id={id}
                  type="radio"
                  name="duration"
                  value={months}
                  checked={plan.durationMonths === months}
                  onChange={() => onChange({ ...plan, durationMonths: months })}
                />
                {strings.durationLabel(months)}
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="plan-fieldset">
        <legend>{strings.storageLegend}</legend>
        <div className="plan-options">
          {STORAGE_GB.map((gb) => {
            const id = `storage-${gb}`;
            return (
              <label key={gb} className="plan-option" htmlFor={id}>
                <input
                  id={id}
                  type="radio"
                  name="storage"
                  value={gb}
                  checked={plan.storageGb === gb}
                  onChange={() => onChange({ ...plan, storageGb: gb })}
                />
                {strings.storageLabel(gb)}
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="plan-fieldset">
        <legend>{strings.upfrontLegend}</legend>
        <label className="plan-option" htmlFor="pay-upfront">
          <input
            id="pay-upfront"
            type="checkbox"
            checked={plan.payUpfront}
            onChange={(event) => onChange({ ...plan, payUpfront: event.target.checked })}
          />
          {strings.upfrontLabel}
        </label>
      </fieldset>
      <div className="price-summary" role="region" aria-live="polite" aria-label={strings.priceLive}>
        <h3>{strings.priceHeading}</h3>
        <dl>
          <div>
            <dt>{strings.priceMonthly}</dt>
            <dd>{formatCents(price.monthlyRateCents, locale)}</dd>
          </div>
          <div>
            <dt>{strings.priceDuration}</dt>
            <dd>{strings.durationLabel(price.durationMonths)}</dd>
          </div>
          <div>
            <dt>{strings.priceSubtotal}</dt>
            <dd>{formatCents(price.subtotalCents, locale)}</dd>
          </div>
          {price.discountCents > 0 && (
            <div>
              <dt>{strings.priceDiscount}</dt>
              <dd>−{formatCents(price.discountCents, locale)}</dd>
            </div>
          )}
          <div className="price-total">
            <dt>{strings.priceTotal}</dt>
            <dd>{formatCents(price.totalCents, locale)}</dd>
          </div>
        </dl>
      </div>
      <p className="fictional-note">{strings.fictionalNote}</p>
      <div className="step-actions">
        <button type="button" className="button" onClick={onContinue}>
          {strings.continue}
        </button>
      </div>
    </section>
  );
}

import { formatCents, pricePlan, type PlanConfig } from "../domain/pricing";
import type { DetailsDraft } from "../domain/details";
import type { LocaleName } from "../lib/types";
import type { UIStrings } from "../lib/i18n";

interface Props {
  plan: PlanConfig;
  details: DetailsDraft;
  orderNumber: string;
  onBack: () => void;
  strings: UIStrings;
  locale: LocaleName;
}

export function ConfirmStep({ plan, details, orderNumber, onBack, strings, locale }: Props) {
  const price = pricePlan(plan);
  return (
    <section className="panel confirm-step" aria-labelledby="confirm-heading">
      <h2 id="confirm-heading">{strings.confirmHeading}</h2>
      <p>{strings.confirmIntro}</p>
      <p className="order-number">
        <span>{strings.orderNumberLabel}</span>
        <strong>{orderNumber}</strong>
      </p>
      <dl className="confirm-summary">
        <div>
          <dt>{strings.confirmName}</dt>
          <dd>{details.name}</dd>
        </div>
        <div>
          <dt>{strings.confirmEmail}</dt>
          <dd>{details.email}</dd>
        </div>
        <div>
          <dt>{strings.durationLegend}</dt>
          <dd>{strings.durationLabel(plan.durationMonths)}</dd>
        </div>
        <div>
          <dt>{strings.storageLegend}</dt>
          <dd>{strings.storageLabel(plan.storageGb)}</dd>
        </div>
        <div>
          <dt>{strings.upfrontLegend}</dt>
          <dd>{plan.payUpfront ? strings.upfrontOn : strings.upfrontOff}</dd>
        </div>
        <div className="price-total">
          <dt>{strings.priceTotal}</dt>
          <dd>{formatCents(price.totalCents, locale)}</dd>
        </div>
      </dl>
      <p className="payment-pending">{strings.paymentPending}</p>
      <p className="fictional-note">{strings.fictionalNote}</p>
      <div className="step-actions">
        <button type="button" className="button button-secondary" onClick={onBack}>
          {strings.back}
        </button>
      </div>
    </section>
  );
}

import { useState, type FormEvent } from "react";
import {
  chargeFakeCard,
  formatPan,
  type PaymentError,
} from "../domain/payment";
import type { UIStrings } from "../lib/i18n";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  strings: UIStrings;
  now?: Date;
  delayMs?: number;
}

function messageFor(error: PaymentError, strings: UIStrings): string {
  if (error === "invalid-number") return strings.panError;
  if (error === "invalid-expiry") return strings.expiryError;
  if (error === "invalid-cvc") return strings.cvcError;
  return strings.declinedError;
}

export function PaymentStep({
  onBack,
  onSuccess,
  strings,
  now = new Date(),
  delayMs = 600,
}: Props) {
  const [pan, setPan] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<PaymentError | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const result = chargeFakeCard({ pan, expiry, cvc }, now);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
      // Drop card fields from memory before leaving the step.
      setPan("");
      setExpiry("");
      setCvc("");
      onSuccess();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel payment-step" aria-labelledby="payment-heading" aria-busy={busy}>
      <h2 id="payment-heading">{strings.paymentHeading}</h2>
      <p className="demo-banner">{strings.paymentDemoLabel}</p>
      <p>{strings.paymentIntro}</p>
      <p className="test-cards">{strings.paymentTestCards}</p>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <div className="field">
          <label htmlFor="pay-pan">{strings.panLabel}</label>
          <input
            id="pay-pan"
            name="cardnumber"
            inputMode="numeric"
            autoComplete="off"
            value={pan}
            aria-invalid={error === "invalid-number"}
            aria-describedby={error === "invalid-number" ? "pay-pan-error" : undefined}
            onChange={(event) => {
              setError(null);
              setPan(formatPan(event.target.value));
            }}
            disabled={busy}
          />
          {error === "invalid-number" && (
            <p id="pay-pan-error" className="field-error" role="alert">
              {strings.panError}
            </p>
          )}
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pay-expiry">{strings.expiryLabel}</label>
            <input
              id="pay-expiry"
              name="cc-exp"
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM/YY"
              value={expiry}
              aria-invalid={error === "invalid-expiry"}
              aria-describedby={error === "invalid-expiry" ? "pay-expiry-error" : undefined}
              onChange={(event) => {
                setError(null);
                setExpiry(event.target.value);
              }}
              disabled={busy}
            />
            {error === "invalid-expiry" && (
              <p id="pay-expiry-error" className="field-error" role="alert">
                {strings.expiryError}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="pay-cvc">{strings.cvcLabel}</label>
            <input
              id="pay-cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="off"
              value={cvc}
              maxLength={4}
              aria-invalid={error === "invalid-cvc"}
              aria-describedby={error === "invalid-cvc" ? "pay-cvc-error" : undefined}
              onChange={(event) => {
                setError(null);
                setCvc(event.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              disabled={busy}
            />
            {error === "invalid-cvc" && (
              <p id="pay-cvc-error" className="field-error" role="alert">
                {strings.cvcError}
              </p>
            )}
          </div>
        </div>
        {error === "declined" && (
          <p className="field-error" role="alert">
            {messageFor(error, strings)}
          </p>
        )}
        <div className="step-actions">
          <button type="button" className="button button-secondary" onClick={onBack} disabled={busy}>
            {strings.back}
          </button>
          <button type="submit" className="button" disabled={busy}>
            {busy ? strings.paying : strings.payNow}
          </button>
        </div>
      </form>
    </section>
  );
}

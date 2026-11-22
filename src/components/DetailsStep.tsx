import { useState, type FormEvent } from "react";
import { validateDetails, type Details, type DetailsDraft, type DetailsField } from "../domain/details";
import type { UIStrings } from "../lib/i18n";

interface Props {
  details: DetailsDraft;
  onChange: (details: DetailsDraft) => void;
  onBack: () => void;
  onContinue: (details: Details) => void;
  strings: UIStrings;
}

export function DetailsStep({ details, onChange, onBack, onContinue, strings }: Props) {
  const [showErrors, setShowErrors] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const result = validateDetails(details);
  const errors = result.ok ? {} : result.errors;

  function message(field: DetailsField): string {
    if (!showErrors || !errors[field]) return "";
    if (field === "name") return strings.nameError;
    if (field === "email") return strings.emailError;
    return strings.termsError;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateDetails(details);
    if (!next.ok) {
      setShowErrors(true);
      setAccepted(false);
      return;
    }
    setAccepted(true);
    onContinue(next.value);
  }

  return (
    <section className="panel details-step" aria-labelledby="details-heading">
      <h2 id="details-heading">{strings.detailsHeading}</h2>
      <p>{strings.detailsIntro}</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="details-name">{strings.nameLabel}</label>
          <input
            id="details-name"
            name="name"
            type="text"
            autoComplete="name"
            value={details.name}
            aria-invalid={showErrors && Boolean(errors.name)}
            aria-describedby={showErrors && errors.name ? "details-name-error" : undefined}
            onChange={(event) => { setAccepted(false); onChange({ ...details, name: event.target.value }); }}
          />
          {message("name") && (
            <p id="details-name-error" className="field-error" role="alert">
              {message("name")}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="details-email">{strings.emailLabel}</label>
          <input
            id="details-email"
            name="email"
            type="email"
            autoComplete="email"
            value={details.email}
            aria-invalid={showErrors && Boolean(errors.email)}
            aria-describedby={showErrors && errors.email ? "details-email-error" : undefined}
            onChange={(event) => { setAccepted(false); onChange({ ...details, email: event.target.value }); }}
          />
          {message("email") && (
            <p id="details-email-error" className="field-error" role="alert">
              {message("email")}
            </p>
          )}
        </div>
        <div className="field">
          <label className="plan-option" htmlFor="details-terms">
            <input
              id="details-terms"
              name="terms"
              type="checkbox"
              checked={details.termsAccepted}
              aria-invalid={showErrors && Boolean(errors.termsAccepted)}
              aria-describedby={showErrors && errors.termsAccepted ? "details-terms-error" : undefined}
              onChange={(event) => { setAccepted(false); onChange({ ...details, termsAccepted: event.target.checked }); }}
            />
            {strings.termsLabel}
          </label>
          {message("termsAccepted") && (
            <p id="details-terms-error" className="field-error" role="alert">
              {message("termsAccepted")}
            </p>
          )}
        </div>
        {accepted && (
          <p className="details-saved" role="status">
            {strings.detailsSaved}
          </p>
        )}
        <div className="step-actions">
          <button type="button" className="button button-secondary" onClick={onBack}>
            {strings.back}
          </button>
          <button type="submit" className="button">
            {strings.continue}
          </button>
        </div>
      </form>
    </section>
  );
}

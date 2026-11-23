# Learning notes

Short explanations of the ideas this project actually uses, and why they matter. Each one points at a file.

## Money stays in integer cents

Prices are stored and computed as euro cents, never as a float of euros. A 50 GB plan is 1499 cents a month, a 12-month term is `1499 * 12`, and the 10% upfront discount is `Math.trunc((subtotal * 10) / 100)`. Truncating toward zero keeps the result an integer, so there is no rounding surprise from binary floats.

`formatCents` is display only. It splits a cent total into euros and a two-digit remainder and prints `€12.99` or `12,99 €`. The UI never parses those strings back into money.

Plan config itself is validated with Zod (`durationMonths` 3/6/12, `storageGb` 5/10/50, `payUpfront` boolean) before it is priced.

See `src/domain/pricing.ts` and `src/domain/pricing.test.ts`.

## Wizard state is durable, and it never includes a card

The current step, the chosen plan and the details live in `sessionStorage`, checked with Zod on the way back in. The step is also written to the query string (`?step=payment`) with `history.pushState`, so back and forward work and a refresh does not reset the checkout. A corrupt or partial payload falls back to the default plan step.

`normalizeWizard` is the gate: payment and confirmation require valid details, and confirmation also requires a successful demo payment. A hand-edited `?step=confirm` cannot skip those checks. The order number is created only after payment succeeds, from the details, the plan and the time. It is a display token, not a server receipt.

Card number, expiry and CVC are React state on the payment step only. They are cleared after the simulated delay, and they are never written to `sessionStorage`, the URL or the confirmation screen.

See `src/lib/wizard.ts`, `src/App.tsx`, `src/lib/wizard.test.ts` and `src/test/wizard.ui.test.tsx`.

## Validation sits at the boundary, and the next step is blocked until it passes

The details form is a draft (`name`, `email`, `termsAccepted: boolean`) until Zod says otherwise. `detailsSchema` requires a trimmed name, a valid email and `termsAccepted: true`. `validateDetails` turns schema issues into per-field flags, so the UI can show inline errors without the schema talking to React. Submit is the moment errors appear; an invalid form does not advance.

The demo payment path is the same idea without a network: `chargeFakeCard` runs Luhn, expiry and CVC checks as pure functions, then either returns a typed error or succeeds. A documented decline number fails after those checks, so the "declined" path can be tested without a processor. The form stays on the payment step until the result is ok.

See `src/domain/details.ts`, `src/domain/payment.ts`, `src/components/DetailsStep.tsx`, `src/components/PaymentStep.tsx`, and the matching tests under `src/domain/` and `src/test/`.

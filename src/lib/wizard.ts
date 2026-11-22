import { z } from "zod";
import { validateDetails, DEFAULT_DETAILS, type DetailsDraft } from "../domain/details";
import { DEFAULT_PLAN } from "../domain/plan";
import { planConfigSchema, type PlanConfig } from "../domain/pricing";

export const STEPS = ["plan", "details", "payment", "confirm"] as const;
export type WizardStep = (typeof STEPS)[number];

export const WIZARD_KEY = "subscription-checkout.v1.wizard";

export interface WizardState {
  step: WizardStep;
  plan: PlanConfig;
  details: DetailsDraft;
  /** Set after a successful demo charge. Never stores card data. */
  paymentCompleted?: boolean;
  orderNumber?: string;
}

const wizardSchema = z.object({
  step: z.enum(STEPS),
  plan: planConfigSchema,
  details: z.object({
    name: z.string(),
    email: z.string(),
    termsAccepted: z.boolean(),
  }),
  paymentCompleted: z.boolean().optional(),
  orderNumber: z.string().min(1).optional(),
});

export const DEFAULT_WIZARD: WizardState = {
  step: "plan",
  plan: DEFAULT_PLAN,
  details: DEFAULT_DETAILS,
};

export function parseStepParam(search: string): WizardStep | null {
  const step = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("step");
  if (step === "plan" || step === "details" || step === "payment" || step === "confirm") return step;
  return null;
}

export function searchWithStep(step: WizardStep, search = ""): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.set("step", step);
  return `?${params.toString()}`;
}

/**
 * Payment and confirm require valid details. Confirm also requires a successful
 * demo payment. Card data is never part of this state.
 */
export function normalizeWizard(state: WizardState): WizardState {
  const detailsOk = validateDetails(state.details).ok;
  const paid = detailsOk && state.paymentCompleted === true;
  let step = state.step;
  if ((step === "payment" || step === "confirm") && !detailsOk) step = "details";
  else if (step === "confirm" && !paid) step = "payment";
  const next: WizardState = { step, plan: state.plan, details: state.details };
  if (paid) next.paymentCompleted = true;
  if (paid && state.orderNumber) next.orderNumber = state.orderNumber;
  return next;
}

export function readWizard(): WizardState {
  try {
    const raw = sessionStorage.getItem(WIZARD_KEY);
    if (raw === null) return DEFAULT_WIZARD;
    const parsed = wizardSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_WIZARD;
    const rawState: WizardState = {
      step: parsed.data.step,
      plan: parsed.data.plan,
      details: parsed.data.details,
    };
    if (parsed.data.paymentCompleted) rawState.paymentCompleted = true;
    if (parsed.data.orderNumber) rawState.orderNumber = parsed.data.orderNumber;
    return normalizeWizard(rawState);
  } catch {
    return DEFAULT_WIZARD;
  }
}

export function writeWizard(state: WizardState): void {
  try {
    sessionStorage.setItem(WIZARD_KEY, JSON.stringify(normalizeWizard(state)));
  } catch {
    /* ignore quota or private mode */
  }
}

export function makeOrderNumber(details: DetailsDraft, plan: PlanConfig, now: Date): string {
  const seed = `${details.email}|${details.name}|${plan.durationMonths}|${plan.storageGb}|${plan.payUpfront}|${now.toISOString()}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const token = (hash >>> 0).toString(36).toUpperCase().padStart(7, "X");
  return `CB-${token.slice(0, 4)}-${token.slice(4, 7)}`;
}

export function ensureOrderNumber(state: WizardState, now: Date): WizardState {
  if (state.step !== "confirm" || !state.paymentCompleted) return state;
  if (state.orderNumber) return state;
  const detailsOk = validateDetails(state.details);
  if (!detailsOk.ok) return state;
  return { ...state, orderNumber: makeOrderNumber(state.details, state.plan, now) };
}

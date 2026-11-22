import { z } from "zod";

export const DURATIONS = [3, 6, 12] as const;
export type DurationMonths = (typeof DURATIONS)[number];

export const STORAGE_GB = [5, 10, 50] as const;
export type StorageGb = (typeof STORAGE_GB)[number];

export const planConfigSchema = z.object({
  durationMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
  storageGb: z.union([z.literal(5), z.literal(10), z.literal(50)]),
  payUpfront: z.boolean(),
});
export type PlanConfig = z.infer<typeof planConfigSchema>;

/** Fictional list prices in euro cents per month. */
export const MONTHLY_RATES_CENTS: Record<StorageGb, number> = {
  5: 399,
  10: 699,
  50: 1499,
};

/** Ten percent, applied only when the full term is paid up front. */
export const UPFRONT_DISCOUNT_PERCENT = 10;

export interface PriceBreakdown {
  monthlyRateCents: number;
  durationMonths: DurationMonths;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  payUpfront: boolean;
}

export function parsePlan(input: unknown): PlanConfig | null {
  const parsed = planConfigSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

/**
 * Price a plan in integer cents. The upfront discount is 10% of the
 * subtotal, truncated toward zero, so money never goes through a float.
 */
export function pricePlan(plan: PlanConfig): PriceBreakdown {
  const monthlyRateCents = MONTHLY_RATES_CENTS[plan.storageGb];
  const subtotalCents = monthlyRateCents * plan.durationMonths;
  const discountCents = plan.payUpfront
    ? Math.trunc((subtotalCents * UPFRONT_DISCOUNT_PERCENT) / 100)
    : 0;
  return {
    monthlyRateCents,
    durationMonths: plan.durationMonths,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    payUpfront: plan.payUpfront,
  };
}

/** Format euro cents as a display string such as "€12.99". Display only. */
export function formatCents(cents: number, locale: "en" | "de" = "en"): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.trunc(abs / 100);
  const rest = abs % 100;
  const fraction = String(rest).padStart(2, "0");
  if (locale === "de") return `${sign}${euros},${fraction}\u00a0€`;
  return `${sign}€${euros}.${fraction}`;
}

import { describe, expect, it } from "vitest";
import {
  DURATIONS,
  MONTHLY_RATES_CENTS,
  STORAGE_GB,
  formatCents,
  parsePlan,
  pricePlan,
  type PlanConfig,
} from "./pricing";

const cases: { plan: PlanConfig; subtotal: number; discount: number; total: number }[] = [
  { plan: { durationMonths: 3, storageGb: 5, payUpfront: false }, subtotal: 1197, discount: 0, total: 1197 },
  { plan: { durationMonths: 3, storageGb: 5, payUpfront: true }, subtotal: 1197, discount: 119, total: 1078 },
  { plan: { durationMonths: 6, storageGb: 10, payUpfront: false }, subtotal: 4194, discount: 0, total: 4194 },
  { plan: { durationMonths: 6, storageGb: 10, payUpfront: true }, subtotal: 4194, discount: 419, total: 3775 },
  { plan: { durationMonths: 12, storageGb: 50, payUpfront: false }, subtotal: 17988, discount: 0, total: 17988 },
  { plan: { durationMonths: 12, storageGb: 50, payUpfront: true }, subtotal: 17988, discount: 1798, total: 16190 },
  { plan: { durationMonths: 12, storageGb: 5, payUpfront: true }, subtotal: 4788, discount: 478, total: 4310 },
];

describe("pricePlan", () => {
  it.each(cases)(
    "$plan.durationMonths months, $plan.storageGb GB, upfront $plan.payUpfront => $total cents",
    ({ plan, subtotal, discount, total }) => {
      const price = pricePlan(plan);
      expect(price.monthlyRateCents).toBe(MONTHLY_RATES_CENTS[plan.storageGb]);
      expect(price.subtotalCents).toBe(subtotal);
      expect(price.discountCents).toBe(discount);
      expect(price.totalCents).toBe(total);
      expect(Number.isInteger(price.totalCents)).toBe(true);
    },
  );

  it("covers every duration and storage pair, with and without the upfront discount", () => {
    const seen: string[] = [];
    for (const durationMonths of DURATIONS) {
      for (const storageGb of STORAGE_GB) {
        for (const payUpfront of [false, true]) {
          const price = pricePlan({ durationMonths, storageGb, payUpfront });
          const expectedSubtotal = MONTHLY_RATES_CENTS[storageGb] * durationMonths;
          const expectedDiscount = payUpfront ? Math.trunc((expectedSubtotal * 10) / 100) : 0;
          expect(price.subtotalCents).toBe(expectedSubtotal);
          expect(price.discountCents).toBe(expectedDiscount);
          expect(price.totalCents).toBe(expectedSubtotal - expectedDiscount);
          expect(price.totalCents % 1).toBe(0);
          seen.push(`${durationMonths}-${storageGb}-${payUpfront}`);
        }
      }
    }
    expect(seen).toHaveLength(DURATIONS.length * STORAGE_GB.length * 2);
  });

  it("does not use floating-point arithmetic on money", () => {
    const source = `${pricePlan.toString()}\n${Math.trunc.toString()}`;
    expect(source).not.toMatch(/\*\s*0\.1|\*\s*0\.9|\/\s*10\.0/);
    const price = pricePlan({ durationMonths: 3, storageGb: 5, payUpfront: true });
    // 1197 * 0.1 in IEEE float is not 119.7 exactly; integer math must yield 119.
    expect(1197 * 0.1).not.toBe(119);
    expect(price.discountCents).toBe(119);
  });
});

describe("parsePlan", () => {
  it("accepts a valid plan and rejects unknown durations, sizes or missing fields", () => {
    expect(parsePlan({ durationMonths: 6, storageGb: 10, payUpfront: true })).toEqual({
      durationMonths: 6,
      storageGb: 10,
      payUpfront: true,
    });
    expect(parsePlan({ durationMonths: 24, storageGb: 10, payUpfront: false })).toBeNull();
    expect(parsePlan({ durationMonths: 3, storageGb: 25, payUpfront: false })).toBeNull();
    expect(parsePlan({ durationMonths: 3, storageGb: 5 })).toBeNull();
    expect(parsePlan(null)).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats integer cents for English and German display", () => {
    expect(formatCents(1078)).toBe("€10.78");
    expect(formatCents(1078, "de")).toBe("10,78\u00a0€");
    expect(formatCents(0)).toBe("€0.00");
    expect(formatCents(5, "en")).toBe("€0.05");
  });
});

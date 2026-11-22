import { describe, expect, it } from "vitest";
import { DEFAULT_DETAILS } from "../domain/details";
import { DEFAULT_PLAN } from "../domain/plan";
import {
  makeOrderNumber,
  normalizeWizard,
  parseStepParam,
  searchWithStep,
} from "./wizard";

describe("wizard helpers", () => {
  it("reads and writes the step query param", () => {
    expect(parseStepParam("?step=details")).toBe("details");
    expect(parseStepParam("?step=payment")).toBe("payment");
    expect(parseStepParam("?foo=1")).toBeNull();
    expect(searchWithStep("confirm", "?theme=1")).toBe("?theme=1&step=confirm");
  });

  it("refuses payment and confirmation when the details are incomplete", () => {
    const clamped = normalizeWizard({
      step: "confirm",
      plan: DEFAULT_PLAN,
      details: DEFAULT_DETAILS,
      paymentCompleted: true,
      orderNumber: "CB-TEST-001",
    });
    expect(clamped.step).toBe("details");
    expect(clamped.orderNumber).toBeUndefined();
    expect(clamped.paymentCompleted).toBeUndefined();
  });

  it("refuses confirmation until the demo payment has succeeded", () => {
    const details = { name: "Ada Lovelace", email: "ada@example.com", termsAccepted: true as const };
    const unpaid = normalizeWizard({
      step: "confirm",
      plan: DEFAULT_PLAN,
      details,
    });
    expect(unpaid.step).toBe("payment");
    const paid = normalizeWizard({
      step: "confirm",
      plan: DEFAULT_PLAN,
      details,
      paymentCompleted: true,
      orderNumber: "CB-TEST-001",
    });
    expect(paid.step).toBe("confirm");
    expect(paid.paymentCompleted).toBe(true);
    expect(paid.orderNumber).toBe("CB-TEST-001");
  });

  it("builds a stable, non-numeric order number from the same inputs", () => {
    const details = { name: "Ada Lovelace", email: "ada@example.com", termsAccepted: true as const };
    const now = new Date("2026-11-22T12:00:00.000Z");
    const first = makeOrderNumber(details, DEFAULT_PLAN, now);
    expect(first).toMatch(/^CB-[A-Z0-9]{4}-[A-Z0-9]{3}$/);
    expect(makeOrderNumber(details, DEFAULT_PLAN, now)).toBe(first);
    expect(makeOrderNumber({ ...details, email: "other@example.com" }, DEFAULT_PLAN, now)).not.toBe(first);
  });
});

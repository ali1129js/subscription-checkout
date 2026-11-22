import { describe, expect, it } from "vitest";
import {
  DECLINE_PAN,
  SUCCESS_PAN,
  SUCCESS_PAN_GROUPS,
  chargeFakeCard,
  cvcValid,
  expiryValid,
  formatPan,
  luhnValid,
  parseExpiry,
} from "./payment";

const NOW = new Date("2026-11-22T12:00:00.000Z");

describe("luhnValid and test numbers", () => {
  it("accepts the documented success card and rejects a number with a bad check digit", () => {
    expect(SUCCESS_PAN).toBe(SUCCESS_PAN_GROUPS.join(""));
    expect(luhnValid(SUCCESS_PAN)).toBe(true);
    expect(luhnValid(formatPan(SUCCESS_PAN))).toBe(true);
    expect(luhnValid("4242 4242 4242 4243")).toBe(false);
    expect(luhnValid("1234")).toBe(false);
    expect(luhnValid("")).toBe(false);
  });

  it("treats the documented decline card as Luhn-valid so the decline is a gateway result, not a typo", () => {
    expect(luhnValid(DECLINE_PAN)).toBe(true);
  });
});

describe("expiry and CVC", () => {
  it("parses MM/YY and keeps a card valid through the end of the expiry month", () => {
    expect(parseExpiry("12/27")).toEqual({ month: 12, year: 2027 });
    expect(parseExpiry("11 / 2026")).toEqual({ month: 11, year: 2026 });
    expect(parseExpiry("13/27")).toBeNull();
    expect(parseExpiry("11-27")).toBeNull();
    expect(expiryValid(11, 2026, NOW)).toBe(true);
    expect(expiryValid(10, 2026, NOW)).toBe(false);
    expect(expiryValid(12, 2025, NOW)).toBe(false);
    expect(cvcValid("123")).toBe(true);
    expect(cvcValid("1234")).toBe(true);
    expect(cvcValid("12")).toBe(false);
    expect(cvcValid("12a")).toBe(false);
  });
});

describe("chargeFakeCard", () => {
  const valid = { pan: SUCCESS_PAN, expiry: "12/27", cvc: "123" };

  it("charges the success test card and declines the documented decline card", () => {
    expect(chargeFakeCard(valid, NOW)).toEqual({ ok: true });
    expect(chargeFakeCard({ ...valid, pan: DECLINE_PAN }, NOW)).toEqual({
      ok: false,
      error: "declined",
    });
  });

  it("reports validation errors without treating them as a decline", () => {
    expect(chargeFakeCard({ ...valid, pan: "4242 4242 4242 4243" }, NOW)).toEqual({
      ok: false,
      error: "invalid-number",
    });
    expect(chargeFakeCard({ ...valid, expiry: "10/26" }, NOW)).toEqual({
      ok: false,
      error: "invalid-expiry",
    });
    expect(chargeFakeCard({ ...valid, cvc: "12" }, NOW)).toEqual({
      ok: false,
      error: "invalid-cvc",
    });
  });

  it("is a pure function with no storage or network side effects", () => {
    const before = { ...sessionStorage };
    chargeFakeCard(valid, NOW);
    expect({ ...sessionStorage }).toEqual(before);
  });
});

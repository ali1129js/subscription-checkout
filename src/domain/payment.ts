/** Documented demo numbers, stored as 4-digit groups so the source has no long digit runs. */
export const SUCCESS_PAN_GROUPS = ["4242", "4242", "4242", "4242"] as const;
export const DECLINE_PAN_GROUPS = ["4000", "0000", "0000", "0002"] as const;

export const SUCCESS_PAN = SUCCESS_PAN_GROUPS.join("");
export const DECLINE_PAN = DECLINE_PAN_GROUPS.join("");

export type PaymentError = "invalid-number" | "invalid-expiry" | "invalid-cvc" | "declined";
export type PaymentResult = { ok: true } | { ok: false; error: PaymentError };

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPan(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function luhnValid(pan: string): boolean {
  const digits = digitsOnly(pan);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleIt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const digit = digits.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return false;
    let next = digit;
    if (doubleIt) {
      next *= 2;
      if (next > 9) next -= 9;
    }
    sum += next;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

export function cvcValid(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(\d{2})\s*\/\s*(\d{2}|\d{4})$/.exec(value.trim());
  if (!match || match[1] === undefined || match[2] === undefined) return null;
  const month = Number(match[1]);
  const rawYear = Number(match[2]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { month, year };
}

/** A card is valid through the last moment of its expiry month. */
export function expiryValid(month: number, year: number, now: Date): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return now.getTime() <= endOfMonth.getTime();
}

/**
 * Pure demo charge. No network, no Stripe, no side effects.
 * 4242 4242 4242 4242 succeeds. 4000 0000 0000 0002 is a documented decline.
 * Other Luhn-valid numbers succeed after expiry and CVC checks.
 */
export function chargeFakeCard(
  input: { pan: string; expiry: string; cvc: string },
  now: Date,
): PaymentResult {
  const pan = digitsOnly(input.pan);
  if (!luhnValid(pan)) return { ok: false, error: "invalid-number" };
  if (!cvcValid(input.cvc)) return { ok: false, error: "invalid-cvc" };
  const expiry = parseExpiry(input.expiry);
  if (!expiry || !expiryValid(expiry.month, expiry.year, now)) {
    return { ok: false, error: "invalid-expiry" };
  }
  if (pan === DECLINE_PAN) return { ok: false, error: "declined" };
  return { ok: true };
}

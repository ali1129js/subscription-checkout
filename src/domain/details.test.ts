import { describe, expect, it } from "vitest";
import { DEFAULT_DETAILS, validateDetails } from "./details";

describe("validateDetails", () => {
  it("rejects an empty draft and a bad email, and accepts a complete form", () => {
    const empty = validateDetails(DEFAULT_DETAILS);
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.errors.name).toBe(true);
      expect(empty.errors.email).toBe(true);
      expect(empty.errors.termsAccepted).toBe(true);
    }

    const badEmail = validateDetails({ name: "Ada Lovelace", email: "not-an-email", termsAccepted: true });
    expect(badEmail.ok).toBe(false);
    if (!badEmail.ok) {
      expect(badEmail.errors.email).toBe(true);
      expect(badEmail.errors.name).toBeUndefined();
    }

    const ok = validateDetails({
      name: "  Ada Lovelace  ",
      email: "ada@example.com",
      termsAccepted: true,
    });
    expect(ok).toEqual({
      ok: true,
      value: { name: "Ada Lovelace", email: "ada@example.com", termsAccepted: true },
    });
  });
});

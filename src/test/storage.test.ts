import { describe, expect, it } from "vitest";
import { KEYS, readStored, themeSchema } from "../lib/storage";
import { DEFAULT_THEME } from "../lib/types";

describe("readStored", () => {
  it("returns the fallback when the key is missing", () => {
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
  });

  it("returns the fallback for corrupt JSON or an unknown theme", () => {
    localStorage.setItem(KEYS.theme, "{");
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
    localStorage.setItem(KEYS.theme, JSON.stringify("navy"));
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("graphite");
  });

  it("returns a valid stored theme", () => {
    localStorage.setItem(KEYS.theme, JSON.stringify("khaki"));
    expect(readStored(KEYS.theme, themeSchema, DEFAULT_THEME)).toBe("khaki");
  });
});

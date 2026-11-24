import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "../styles/gloss.css"), "utf8");

function bgFor(theme: string | null): string {
  if (theme === null) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
  return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim().toLowerCase();
}

describe("gloss.css cascade", () => {
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement("style");
    style.textContent = css;
    document.head.append(style);
  });

  afterEach(() => {
    style.remove();
  });

  it("applies the Khaki background when Khaki is selected", () => {
    expect(bgFor("khaki")).toBe("#d8cdae");
  });

  it("keeps Graphite as the selected and the default background", () => {
    expect(bgFor("graphite")).toBe("#1e2329");
    expect(bgFor(null)).toBe("#1e2329");
  });

  it("applies the Midnight background when Midnight is selected", () => {
    expect(bgFor("midnight")).toBe("#1b1428");
  });
});

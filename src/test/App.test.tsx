import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { KEYS } from "../lib/storage";

describe("App shell", () => {
  it("renders the fictional company and defaults to Graphite and English", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "CloudBox Storage", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/fictional cloud storage subscription checkout/)).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("graphite");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.motion).toBe("static");
  });

  it("switches theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Khaki" }));
    expect(document.documentElement.dataset.theme).toBe("khaki");
    expect(localStorage.getItem(KEYS.theme)).toBe(JSON.stringify("khaki"));
    await user.click(screen.getByRole("button", { name: "Midnight" }));
    expect(document.documentElement.dataset.theme).toBe("midnight");
  });

  it("toggles motion and persists it; stays static by default", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "Animated background" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(document.documentElement.dataset.motion).toBe("animated");
    expect(localStorage.getItem(KEYS.motion)).toBe(JSON.stringify("animated"));
    expect(screen.getByRole("button", { name: "Animated background" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches the UI to German and back", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "DE" }));
    expect(document.documentElement.lang).toBe("de");
    expect(
      screen.getByRole("heading", { name: "Als Nächstes kommt die Planauswahl" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(KEYS.locale)).toBe(JSON.stringify("de"));
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(
      screen.getByRole("heading", { name: "CloudBox Storage", level: 1 }),
    ).toBeInTheDocument();
  });
});

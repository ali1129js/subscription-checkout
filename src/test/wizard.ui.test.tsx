import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { STRINGS } from "../lib/i18n";
import { WIZARD_KEY } from "../lib/wizard";

const strings = STRINGS.en;

async function completeCheckout(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: strings.durationLabel(12) }));
  await user.click(screen.getByRole("button", { name: strings.continue }));
  await user.type(screen.getByLabelText(strings.nameLabel), "Ada Lovelace");
  await user.type(screen.getByLabelText(strings.emailLabel), "ada@example.com");
  await user.click(screen.getByRole("checkbox", { name: strings.termsLabel }));
  await user.click(screen.getByRole("button", { name: strings.continue }));
}

describe("Wizard flow", () => {
  it("shows a progress indicator and keeps plan and details when moving back and forward", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("navigation", { name: strings.progressLabel })).toBeInTheDocument();
    expect(screen.getByText(strings.progressStep(1, 3, strings.stepPlan))).toBeInTheDocument();

    await completeCheckout(user);
    expect(screen.getByRole("heading", { name: strings.confirmHeading })).toBeInTheDocument();
    const order = screen.getByText(/CB-/).textContent;
    expect(order).toMatch(/CB-[A-Z0-9]{4}-[A-Z0-9]{3}/);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(strings.durationLabel(12))).toBeInTheDocument();
    expect(screen.getByText(strings.paymentPending)).toBeInTheDocument();
    expect(screen.getByText(strings.progressStep(3, 3, strings.stepConfirm))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByLabelText(strings.nameLabel)).toHaveValue("Ada Lovelace");
    expect(screen.getByText(strings.progressStep(2, 3, strings.stepDetails))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByRole("radio", { name: strings.durationLabel(12) })).toBeChecked();
  });

  it("restores the confirmation after a refresh and via the browser back button", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await completeCheckout(user);
    const order = screen.getByText(/CB-/).textContent;
    expect(sessionStorage.getItem(WIZARD_KEY)).toContain("confirm");
    unmount();

    render(<App />);
    expect(screen.getByRole("heading", { name: strings.confirmHeading })).toBeInTheDocument();
    expect(screen.getByText(/CB-/).textContent).toBe(order);

    window.history.back();
    expect(await screen.findByRole("heading", { name: strings.detailsHeading })).toBeInTheDocument();
    expect(screen.getByLabelText(strings.emailLabel)).toHaveValue("ada@example.com");
  });
});

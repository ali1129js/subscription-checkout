import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { SUCCESS_PAN, SUCCESS_PAN_GROUPS } from "../domain/payment";
import { STRINGS } from "../lib/i18n";
import { WIZARD_KEY } from "../lib/wizard";

const strings = STRINGS.en;
const NOW = new Date("2026-11-22T12:00:00.000Z");

function renderCheckout() {
  return render(<App paymentDelayMs={0} now={NOW} />);
}

async function completeCheckout(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: strings.durationLabel(12) }));
  await user.click(screen.getByRole("button", { name: strings.continue }));
  await user.type(screen.getByLabelText(strings.nameLabel), "Ada Lovelace");
  await user.type(screen.getByLabelText(strings.emailLabel), "ada@example.com");
  await user.click(screen.getByRole("checkbox", { name: strings.termsLabel }));
  await user.click(screen.getByRole("button", { name: strings.continue }));
  await user.type(screen.getByLabelText(strings.panLabel), SUCCESS_PAN_GROUPS.join(""));
  await user.type(screen.getByLabelText(strings.expiryLabel), "12/27");
  await user.type(screen.getByLabelText(strings.cvcLabel), "123");
  await user.click(screen.getByRole("button", { name: strings.payNow }));
  expect(await screen.findByRole("heading", { name: strings.confirmHeading })).toBeInTheDocument();
}

describe("Wizard flow", () => {
  it("shows a progress indicator and keeps plan, details and payment when moving back and forward", async () => {
    const user = userEvent.setup();
    renderCheckout();
    expect(screen.getByRole("navigation", { name: strings.progressLabel })).toBeInTheDocument();
    expect(screen.getByText(strings.progressStep(1, 4, strings.stepPlan))).toBeInTheDocument();

    await completeCheckout(user);
    const order = screen.getByText(/CB-/).textContent;
    expect(order).toMatch(/CB-[A-Z0-9]{4}-[A-Z0-9]{3}/);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(strings.durationLabel(12))).toBeInTheDocument();
    expect(screen.getByText(strings.paymentPending)).toBeInTheDocument();
    expect(screen.getByText(strings.progressStep(4, 4, strings.stepConfirm))).toBeInTheDocument();

    const stored = sessionStorage.getItem(WIZARD_KEY) ?? "";
    expect(stored).toContain("confirm");
    expect(stored).toContain("paymentCompleted");
    expect(stored).not.toContain(SUCCESS_PAN);
    expect(stored).not.toContain(SUCCESS_PAN_GROUPS.join(" "));

    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByRole("heading", { name: strings.paymentHeading })).toBeInTheDocument();
    expect(screen.getByText(strings.progressStep(3, 4, strings.stepPayment))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByLabelText(strings.nameLabel)).toHaveValue("Ada Lovelace");
    expect(screen.getByText(strings.progressStep(2, 4, strings.stepDetails))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByRole("radio", { name: strings.durationLabel(12) })).toBeChecked();
  });

  it("restores the confirmation after a refresh and via the browser back button", async () => {
    const user = userEvent.setup();
    const { unmount } = renderCheckout();
    await completeCheckout(user);
    const order = screen.getByText(/CB-/).textContent;
    expect(sessionStorage.getItem(WIZARD_KEY)).toContain("confirm");
    unmount();

    renderCheckout();
    expect(screen.getByRole("heading", { name: strings.confirmHeading })).toBeInTheDocument();
    expect(screen.getByText(/CB-/).textContent).toBe(order);

    window.history.back();
    expect(await screen.findByRole("heading", { name: strings.paymentHeading })).toBeInTheDocument();
  });
});

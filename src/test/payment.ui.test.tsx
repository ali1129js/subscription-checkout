import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { PaymentStep } from "../components/PaymentStep";
import { DECLINE_PAN_GROUPS, SUCCESS_PAN_GROUPS } from "../domain/payment";
import { STRINGS } from "../lib/i18n";
import { WIZARD_KEY } from "../lib/wizard";

const strings = STRINGS.en;
const NOW = new Date("2026-11-22T12:00:00.000Z");

async function goToPayment(user: ReturnType<typeof userEvent.setup>) {
  render(<App paymentDelayMs={0} now={NOW} />);
  await user.click(screen.getByRole("button", { name: strings.continue }));
  await user.type(screen.getByLabelText(strings.nameLabel), "Ada Lovelace");
  await user.type(screen.getByLabelText(strings.emailLabel), "ada@example.com");
  await user.click(screen.getByRole("checkbox", { name: strings.termsLabel }));
  await user.click(screen.getByRole("button", { name: strings.continue }));
  expect(screen.getByRole("heading", { name: strings.paymentHeading })).toBeInTheDocument();
}

describe("Demo payment form", () => {
  it("is clearly labelled as a demo and documents the test cards", async () => {
    const user = userEvent.setup();
    await goToPayment(user);
    expect(screen.getByText(strings.paymentDemoLabel)).toBeInTheDocument();
    expect(screen.getByText(strings.paymentTestCards)).toBeInTheDocument();
  });

  it("shows validation errors and does not continue with a bad card", async () => {
    const user = userEvent.setup();
    await goToPayment(user);
    await user.click(screen.getByRole("button", { name: strings.payNow }));
    expect(screen.getByText(strings.panError)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.paymentHeading })).toBeInTheDocument();
  });

  it("declines the documented decline card and never stores card data", async () => {
    const user = userEvent.setup();
    await goToPayment(user);
    await user.type(screen.getByLabelText(strings.panLabel), DECLINE_PAN_GROUPS.join(""));
    await user.type(screen.getByLabelText(strings.expiryLabel), "12/27");
    await user.type(screen.getByLabelText(strings.cvcLabel), "123");
    await user.click(screen.getByRole("button", { name: strings.payNow }));
    expect(screen.getByText(strings.declinedError)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.paymentHeading })).toBeInTheDocument();
    const stored = sessionStorage.getItem(WIZARD_KEY) ?? "";
    expect(stored).not.toContain(DECLINE_PAN_GROUPS.join(""));
    expect(stored).not.toContain(DECLINE_PAN_GROUPS.join(" "));
    expect(stored).not.toContain("paymentCompleted");
  });

  it("shows a processing state during the simulated delay, then succeeds", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(
      <PaymentStep
        onBack={() => undefined}
        onSuccess={onSuccess}
        strings={strings}
        now={NOW}
        delayMs={80}
      />,
    );
    await user.type(screen.getByLabelText(strings.panLabel), SUCCESS_PAN_GROUPS.join(""));
    await user.type(screen.getByLabelText(strings.expiryLabel), "12/27");
    await user.type(screen.getByLabelText(strings.cvcLabel), "123");
    const submitted = user.click(screen.getByRole("button", { name: strings.payNow }));
    expect(await screen.findByRole("button", { name: strings.paying })).toBeDisabled();
    expect(onSuccess).not.toHaveBeenCalled();
    await submitted;
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { STRINGS } from "../lib/i18n";
import { formatCents, pricePlan } from "../domain/pricing";

const strings = STRINGS.en;

describe("Plan selection", () => {
  it("shows a live price for the default plan and updates it when options change", async () => {
    const user = userEvent.setup();
    render(<App />);
    const summary = screen.getByRole("region", { name: strings.priceLive });
    const total = () => within(summary).getByText(strings.priceTotal).closest("div")?.querySelector("dd");
    const initial = pricePlan({ durationMonths: 3, storageGb: 5, payUpfront: false });
    expect(total()).toHaveTextContent(formatCents(initial.totalCents, "en"));

    await user.click(screen.getByRole("radio", { name: strings.durationLabel(12) }));
    await user.click(screen.getByRole("radio", { name: strings.storageLabel(50) }));
    await user.click(screen.getByRole("checkbox", { name: strings.upfrontLabel }));

    const next = pricePlan({ durationMonths: 12, storageGb: 50, payUpfront: true });
    expect(total()).toHaveTextContent(formatCents(next.totalCents, "en"));
    expect(within(summary).getByText(`−${formatCents(next.discountCents, "en")}`)).toBeInTheDocument();
  });

  it("lets a keyboard user change duration, storage and the upfront option", async () => {
    const user = userEvent.setup();
    render(<App />);
    const months6 = screen.getByRole("radio", { name: strings.durationLabel(6) });
    months6.focus();
    expect(months6).toHaveFocus();
    await user.keyboard(" ");
    expect(months6).toBeChecked();

    const storage10 = screen.getByRole("radio", { name: strings.storageLabel(10) });
    storage10.focus();
    await user.keyboard(" ");
    expect(storage10).toBeChecked();

    const upfront = screen.getByRole("checkbox", { name: strings.upfrontLabel });
    upfront.focus();
    await user.keyboard(" ");
    expect(upfront).toBeChecked();

    const price = pricePlan({ durationMonths: 6, storageGb: 10, payUpfront: true });
    expect(screen.getByText(formatCents(price.totalCents, "en"))).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { STRINGS } from "../lib/i18n";

const strings = STRINGS.en;

async function goToDetails(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);
  await user.click(screen.getByRole("button", { name: strings.continue }));
  expect(screen.getByRole("heading", { name: strings.detailsHeading })).toBeInTheDocument();
}

describe("Details form", () => {
  it("does not continue while the form is invalid and shows inline errors", async () => {
    const user = userEvent.setup();
    await goToDetails(user);
    await user.click(screen.getByRole("button", { name: strings.continue }));
    expect(screen.getByRole("heading", { name: strings.detailsHeading })).toBeInTheDocument();
    expect(screen.getByText(strings.nameError)).toBeInTheDocument();
    expect(screen.getByText(strings.emailError)).toBeInTheDocument();
    expect(screen.getByText(strings.termsError)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(strings.nameLabel), "Ada Lovelace");
    await user.type(screen.getByLabelText(strings.emailLabel), "not-an-email");
    await user.click(screen.getByRole("checkbox", { name: strings.termsLabel }));
    await user.click(screen.getByRole("button", { name: strings.continue }));
    expect(screen.getByText(strings.emailError)).toBeInTheDocument();
    expect(screen.queryByText(strings.nameError)).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("accepts a valid name, email and terms, and can go back to the plan", async () => {
    const user = userEvent.setup();
    await goToDetails(user);
    await user.type(screen.getByLabelText(strings.nameLabel), "Ada Lovelace");
    await user.type(screen.getByLabelText(strings.emailLabel), "ada@example.com");
    await user.click(screen.getByRole("checkbox", { name: strings.termsLabel }));
    await user.click(screen.getByRole("button", { name: strings.continue }));
    expect(screen.queryByText(strings.nameError)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.emailError)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.termsError)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.confirmHeading })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByRole("heading", { name: strings.detailsHeading })).toBeInTheDocument();
    expect(screen.getByLabelText(strings.nameLabel)).toHaveValue("Ada Lovelace");
    await user.click(screen.getByRole("button", { name: strings.back }));
    expect(screen.getByRole("heading", { name: strings.planHeading })).toBeInTheDocument();
  });
});

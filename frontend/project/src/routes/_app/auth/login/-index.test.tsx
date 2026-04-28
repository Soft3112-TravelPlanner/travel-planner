import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RouteComponent } from "./index";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children, ...props }: { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("Login route", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows error message when login fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "E-posta veya şifre hatalı" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<RouteComponent />);
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (!emailInput || !passwordInput) {
      throw new Error("Login inputs not found");
    }

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("E-posta veya şifre hatalı")).toBeTruthy();
    });
  });
});

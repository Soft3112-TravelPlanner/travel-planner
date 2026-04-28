import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouteComponent } from "./_app";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children, ...props }: { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock("@heroui/use-theme", () => ({
  useTheme: () => ({}),
}));

describe("App layout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows login actions when logged out", () => {
    render(<RouteComponent />);

    expect(screen.getByText("Login")).toBeTruthy();
    expect(screen.getByText("Sign Up")).toBeTruthy();
  });

  it("shows logout action when logged in", async () => {
    localStorage.setItem(
      "travel-planner-profile",
      JSON.stringify({ token: "token" })
    );

    render(<RouteComponent />);

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeTruthy();
    });
  });
});

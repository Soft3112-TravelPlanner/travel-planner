import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RouteComponent } from "./index";
import { PROFILE_STORAGE_KEY } from "@/constants/storage";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  useNavigate: () => navigateMock,
}));

describe("Logout route", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears profile and navigates on logout", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ token: "token" }));

    render(<RouteComponent />);

    fireEvent.click(screen.getByRole("button", { name: /yes, sign out/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: "/auth/login" });
    });
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  });

  it("calls history.back when canceling", () => {
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});

    render(<RouteComponent />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});

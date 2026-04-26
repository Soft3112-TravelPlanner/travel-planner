import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays value updates until the configured timeout passes", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "istanbul" } },
    );

    expect(result.current).toBe("istanbul");

    rerender({ value: "tokyo" });
    expect(result.current).toBe("istanbul");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("tokyo");
  });
});

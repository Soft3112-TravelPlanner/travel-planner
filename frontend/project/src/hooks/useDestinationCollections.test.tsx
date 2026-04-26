import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDestinationCollections } from "./useDestinationCollections";
import type { Trip } from "@/interfaces";

const FAVORITES_STORAGE_KEY = "travel-planner-favorites";
const TRIPS_STORAGE_KEY = "travel-planner-trips";

const plannedTrip: Trip = {
  id: "trip-1",
  name: "Spring Break",
  destinationId: "1",
  startDate: "2026-05-01",
  endDate: "2026-05-08",
  itinerary: ["1"],
};

describe("useDestinationCollections", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads stored favorites and trips", () => {
    globalThis.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(["1", "2"]),
    );
    globalThis.localStorage.setItem(
      TRIPS_STORAGE_KEY,
      JSON.stringify([plannedTrip]),
    );

    const { result } = renderHook(() => useDestinationCollections());

    expect(result.current.favorites).toEqual(["1", "2"]);
    expect(result.current.trips).toEqual([plannedTrip]);
  });

  it("falls back to empty arrays when stored data is invalid", () => {
    globalThis.localStorage.setItem(FAVORITES_STORAGE_KEY, "not-json");
    globalThis.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify({ id: "1" }));

    const { result } = renderHook(() => useDestinationCollections());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.trips).toEqual([]);
  });

  it("toggles favorites and persists the result", () => {
    const { result } = renderHook(() => useDestinationCollections());

    act(() => {
      result.current.toggleFavorite("2");
    });

    expect(result.current.favorites).toEqual(["2"]);
    expect(globalThis.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(
      JSON.stringify(["2"]),
    );

    act(() => {
      result.current.toggleFavorite("2");
    });

    expect(result.current.favorites).toEqual([]);
    expect(globalThis.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(
      JSON.stringify([]),
    );
  });

  it("adds a destination to a trip once and clears the added indicator", () => {
    vi.useFakeTimers();
    globalThis.localStorage.setItem(
      TRIPS_STORAGE_KEY,
      JSON.stringify([plannedTrip]),
    );

    const { result } = renderHook(() => useDestinationCollections());

    act(() => {
      result.current.addToTrip("2", plannedTrip.id);
    });

    expect(result.current.trips[0].itinerary).toEqual(["1", "2"]);
    expect(result.current.addedStatus["2"]).toBe(true);
    expect(JSON.parse(globalThis.localStorage.getItem(TRIPS_STORAGE_KEY) ?? "[]"))
      .toEqual([{ ...plannedTrip, itinerary: ["1", "2"] }]);

    act(() => {
      result.current.addToTrip("2", plannedTrip.id);
    });

    expect(result.current.trips[0].itinerary).toEqual(["1", "2"]);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.addedStatus["2"]).toBe(false);
  });
});

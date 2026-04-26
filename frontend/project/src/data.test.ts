import { describe, expect, it } from "vitest";
import { destinations } from "./data";

describe("destination data", () => {
  it("contains searchable destination records with map-ready coordinates", () => {
    expect(destinations.length).toBeGreaterThan(0);

    for (const destination of destinations) {
      expect(destination.id).toBeTruthy();
      expect(destination.name).toBeTruthy();
      expect(destination.city).toBeTruthy();
      expect(destination.country).toBeTruthy();
      expect(destination.coordinates.lat).toEqual(expect.any(Number));
      expect(destination.coordinates.lng).toEqual(expect.any(Number));
      expect(destination.estimatedBudget).toBeGreaterThan(0);
    }
  });
});

import { useEffect, useRef, useState } from "react";
import type { Destination, Trip } from "@/interfaces";

const FAVORITES_STORAGE_KEY = "travel-planner-favorites";
const TRIPS_STORAGE_KEY = "travel-planner-trips";
const ADDED_STATUS_DURATION_MS = 2000;

function readStoredArray<T>(key: string): T[] {
  try {
    const stored = globalThis.localStorage?.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function storeArray<T>(key: string, value: T[]): void {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
}

export function useDestinationCollections() {
  const [trips, setTrips] = useState<Trip[]>(() =>
    readStoredArray<Trip>(TRIPS_STORAGE_KEY),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStoredArray<string>(FAVORITES_STORAGE_KEY),
  );
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});
  const addedTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timeouts = addedTimeoutsRef.current;
    return () => {
      for (const timeoutId of Object.values(timeouts)) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  const toggleFavorite = (destinationId: Destination["id"]) => {
    setFavorites((previousFavorites) => {
      const nextFavorites = previousFavorites.includes(destinationId)
        ? previousFavorites.filter((favoriteId: string) => favoriteId !== destinationId)
        : [...previousFavorites, destinationId];

      storeArray(FAVORITES_STORAGE_KEY, nextFavorites);
      return nextFavorites;
    });
  };

  const addToTrip = (destinationId: Destination["id"], tripId: Trip["id"]) => {
    setTrips((previousTrips) => {
      const updatedTrips = previousTrips.map((trip) => {
        if (trip.id !== tripId) {
          return trip;
        }

        const itinerary = trip.itinerary ?? [];

        if (itinerary.includes(destinationId)) {
          return trip;
        }

        return { ...trip, itinerary: [...itinerary, destinationId] };
      });

      storeArray(TRIPS_STORAGE_KEY, updatedTrips);
      return updatedTrips;
    });
    setAddedStatus((previousStatus) => ({
      ...previousStatus,
      [destinationId]: true,
    }));

    const existingTimeout = addedTimeoutsRef.current[destinationId];
    if (existingTimeout !== undefined) {
      globalThis.clearTimeout(existingTimeout);
    }
    addedTimeoutsRef.current[destinationId] = globalThis.setTimeout(() => {
      setAddedStatus((previousStatus) => ({
        ...previousStatus,
        [destinationId]: false,
      }));
      delete addedTimeoutsRef.current[destinationId];
    }, ADDED_STATUS_DURATION_MS);
  };

  return {
    addedStatus,
    addToTrip,
    favorites,
    toggleFavorite,
    trips,
  };
}

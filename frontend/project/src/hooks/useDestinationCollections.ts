import { useState } from "react";
import type { Destination, Trip } from "@/interfaces";

const FAVORITES_STORAGE_KEY = "travel-planner-favorites";
const TRIPS_STORAGE_KEY = "travel-planner-trips";
const ADDED_STATUS_DURATION_MS = 2000;

function readStoredArray<T>(key: string): T[] {
  try {
    const stored = globalThis.localStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function storeArray<T>(key: string, value: T[]) {
  globalThis.localStorage.setItem(key, JSON.stringify(value));
}

export function useDestinationCollections() {
  const [trips, setTrips] = useState<Trip[]>(() =>
    readStoredArray<Trip>(TRIPS_STORAGE_KEY),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStoredArray<string>(FAVORITES_STORAGE_KEY),
  );
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});

  const toggleFavorite = (destinationId: Destination["id"]) => {
    setFavorites((previousFavorites) => {
      const nextFavorites = previousFavorites.includes(destinationId)
        ? previousFavorites.filter((favoriteId) => favoriteId !== destinationId)
        : [...previousFavorites, destinationId];

      storeArray(FAVORITES_STORAGE_KEY, nextFavorites);
      return nextFavorites;
    });
  };

  const addToTrip = (destinationId: Destination["id"], tripId: Trip["id"]) => {
    const updatedTrips = trips.map((trip) => {
      if (trip.id !== tripId) {
        return trip;
      }

      const itinerary = trip.itinerary ?? [];

      if (itinerary.includes(destinationId)) {
        return trip;
      }

      return { ...trip, itinerary: [...itinerary, destinationId] };
    });

    setTrips(updatedTrips);
    storeArray(TRIPS_STORAGE_KEY, updatedTrips);
    setAddedStatus((previousStatus) => ({
      ...previousStatus,
      [destinationId]: true,
    }));
    globalThis.setTimeout(() => {
      setAddedStatus((previousStatus) => ({
        ...previousStatus,
        [destinationId]: false,
      }));
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

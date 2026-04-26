import type { ReactNode } from "react";
import { DestinationCard } from "./DestinationCard";
import type { Destination, Trip } from "@/interfaces";

type DestinationGridProps = Readonly<{
  destinations: Destination[];
  favorites: string[];
  trips: Trip[];
  addedStatus: Record<string, boolean>;
  onOpen: (destination: Destination) => void;
  onToggleFavorite: (destinationId: Destination["id"]) => void;
  onAddToTrip: (destinationId: Destination["id"], tripId: Trip["id"]) => void;
  emptyState: ReactNode;
}>;

export function DestinationGrid({
  destinations,
  favorites,
  trips,
  addedStatus,
  onOpen,
  onToggleFavorite,
  onAddToTrip,
  emptyState,
}: DestinationGridProps) {
  if (destinations.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {destinations.map((dest, index) => (
        <DestinationCard
          key={dest.id}
          destination={dest}
          index={index}
          isFavorite={favorites.includes(dest.id)}
          trips={trips}
          isAddedToTrip={Boolean(addedStatus[dest.id])}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
          onAddToTrip={onAddToTrip}
        />
      ))}
    </div>
  );
}

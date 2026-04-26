import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, useDisclosure } from "@heroui/react";
import { IoHeartOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { destinations } from "@/data";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinationCollections } from "@/hooks/useDestinationCollections";

export const Route = createFileRoute('/_app/favorites/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const { addedStatus, addToTrip, favorites, toggleFavorite, trips } =
    useDestinationCollections();

  const favoriteDestinations = useMemo(() => {
    return destinations.filter((dest) => favorites.includes(dest.id));
  }, [favorites]);

  const handleOpenModal = (dest: Destination) => {
    setSelectedDest(dest);
    onOpen();
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-12 p-6 max-w-7xl mx-auto w-full pb-20">
        <section className="flex flex-col gap-4 items-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight italic">
              My <span className="text-primary not-italic">Favorites</span>
            </h1>
            <p className="text-default-500 max-w-lg mt-2 mx-auto">
              Your curated collection of dream destinations.
            </p>
          </motion.div>
        </section>

        <section className="flex flex-col gap-8">
          {favoriteDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteDestinations.map((dest, index) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  index={index}
                  isFavorite={favorites.includes(dest.id)}
                  trips={trips}
                  isAddedToTrip={Boolean(addedStatus[dest.id])}
                  onOpen={handleOpenModal}
                  onToggleFavorite={toggleFavorite}
                  onAddToTrip={addToTrip}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="bg-default-100 p-8 rounded-full mb-6">
                <IoHeartOutline size={48} className="text-default-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
              <p className="text-default-500 max-w-sm mb-8">
                Start exploring the world and save your favorite spots to see them here.
              </p>
              <Button 
                as={Link}
                to="/search"
                color="primary" 
                variant="shadow"
                className="font-bold px-8"
              >
                Discover Destinations
              </Button>
            </motion.div>
          )}
        </section>
      </div>

      <DestinationModal
        destination={selectedDest}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}

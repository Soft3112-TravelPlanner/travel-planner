import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardBody,
  Image,
  Button,
  Chip,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  IoLocationOutline,
  IoStar,
  IoHeart,
  IoHeartOutline,
  IoAdd,
  IoCheckmarkOutline,
  IoMap,
} from "react-icons/io5";
import { motion } from "framer-motion";
import { destinations } from "@/data";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";

export const Route = createFileRoute('/_app/favorites/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const [trips, setTrips] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-trips");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const favoriteDestinations = useMemo(() => {
    return destinations.filter((dest) => favorites.includes(String(dest.id)));
  }, [favorites]);

  const toggleFavorite = (id: string | number) => {
    const strId = String(id);
    setFavorites((prev) => {
      const next = prev.includes(strId)
        ? prev.filter((fid) => fid !== strId)
        : [...prev, strId];
      localStorage.setItem("travel-planner-favorites", JSON.stringify(next));
      return next;
    });
  };

  const handleAddToTrip = (destId: string | number, tripId: string) => {
    const updatedTrips = trips.map((trip) => {
      if (String(trip.id) === tripId) {
        const itinerary = trip.itinerary || [];
        if (!itinerary.includes(String(destId))) {
          return { ...trip, itinerary: [...itinerary, String(destId)] };
        }
      }
      return trip;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setAddedStatus((prev) => ({ ...prev, [destId]: true }));
    setTimeout(() => setAddedStatus((prev) => ({ ...prev, [destId]: false })), 2000);
  };

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
              {favoriteDestinations.map((dest, index) => {
                const isFavorite = favorites.includes(String(dest.id));

                return (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      isPressable
                      className="group border-none bg-background hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden"
                      onPress={() => handleOpenModal(dest)}
                    >
                      <div className="relative h-[280px] w-full overflow-hidden">
                        <Image
                          alt={dest.name}
                          src={dest.mainImageUrl}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          removeWrapper
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="absolute top-4 left-4 z-20">
                          <Button
                            isIconOnly
                            radius="full"
                            size="sm"
                            className={`backdrop-blur-md shadow-lg transition-colors ${
                              isFavorite ? "bg-danger text-white" : "bg-white/80 text-black hover:bg-white"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(dest.id);
                            }}
                          >
                            {isFavorite ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
                          </Button>
                        </div>

                        <div className="absolute top-4 right-4 z-20">
                          <Chip
                            className="bg-white/90 backdrop-blur-md border-none font-bold text-black shadow-lg"
                            variant="flat"
                            size="md"
                          >
                            ${dest.estimatedBudget}
                          </Chip>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <div className="flex items-center gap-1 text-white text-sm font-medium">
                            <IoLocationOutline size={16} />
                            {dest.city}, {dest.country}
                          </div>
                        </div>
                      </div>

                      <CardBody className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold italic group-hover:text-primary transition-colors">
                            {dest.name}
                          </h3>
                          <div className="flex items-center gap-1 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-xs font-black">
                            <IoStar size={14} />
                            {dest.averageRating || "4.8"}
                          </div>
                        </div>

                        <p className="text-default-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                          {dest.description}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            color="primary"
                            className="flex-1 font-bold rounded-2xl shadow-lg shadow-primary/20"
                            onPress={() => handleOpenModal(dest)}
                          >
                            Explore
                          </Button>
                          {trips.length > 0 && (
                            <Dropdown placement="bottom-end">
                              <DropdownTrigger>
                                <Button 
                                  variant="flat" 
                                  color={addedStatus[dest.id] ? "success" : "default"} 
                                  isIconOnly
                                  className="rounded-2xl"
                                >
                                  {addedStatus[dest.id] ? <IoCheckmarkOutline size={20} /> : <IoAdd size={20} />}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu 
                                aria-label="Add to Trip" 
                                onAction={(key) => handleAddToTrip(dest.id, String(key))}
                              >
                                {trips.map((trip) => (
                                  <DropdownItem key={trip.id} startContent={<IoMap size={18} />}>
                                    {trip.name}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
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

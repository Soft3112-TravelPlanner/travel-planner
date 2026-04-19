import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
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
} from "react-icons/io5";
import { destinations } from "@/data";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";

export const Route = createFileRoute('/_app/favorites/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  // Gezileri (Trips) tarayıcıdan çek (Hızlı ekleme için)
  const [trips, setTrips] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-trips");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});

  // Favorileri tarayıcı hafızasından çekiyoruz
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sadece favoriye eklenmiş olan destinasyonları filtrele
  const favoriteDestinations = useMemo(() => {
    return destinations.filter((dest) => favorites.includes(String(dest.id)));
  }, [favorites]);

  // Favorilerden Çıkarma / Ekleme Fonksiyonu
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

  // Geziye Ekleme Fonksiyonu
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
      <div className="flex-1 flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full mt-8">
        <section className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">My Favorites</h1>
          <p className="text-default-500 max-w-lg">
            Your saved destinations for future trips.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          {favoriteDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteDestinations.map((dest) => {
                const isFavorite = favorites.includes(String(dest.id));

                return (
                  <Card
                    key={dest.id}
                    isPressable
                    className="group border-none bg-background/60 dark:bg-default-100/50 relative"
                    onPress={() => handleOpenModal(dest)}
                  >
                    {/* FAVORİ BUTONU */}
                    <div className="absolute top-3 left-3 z-30">
                      <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="flat"
                        color={isFavorite ? "danger" : "default"}
                        className="bg-background/80 backdrop-blur-md shadow-sm"
                        onPress={() => toggleFavorite(dest.id)}
                      >
                        {isFavorite ? (
                          <IoHeart size={18} className="text-danger" />
                        ) : (
                          <IoHeartOutline size={18} />
                        )}
                      </Button>
                    </div>

                    {/* BÜTÇE ÇIKARTMASI */}
                    <div className="absolute top-3 right-3 z-20">
                      <Chip
                        color="success"
                        variant="shadow"
                        size="sm"
                        className="font-bold tracking-wide"
                      >
                        ${dest.estimatedBudget}
                      </Chip>
                    </div>

                    <CardHeader className="p-0 overflow-hidden">
                      <Image
                        alt={dest.name}
                        classNames={{
                          wrapper: "w-full !max-w-full",
                          img: "object-cover h-[240px] w-full",
                        }}
                        className="object-cover rounded-none h-[220px] w-full group-hover:scale-110 transition-transform duration-500"
                        src={dest.mainImageUrl}
                      />
                    </CardHeader>
                    <CardBody className="p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-lg font-bold">{dest.name}</h3>
                          <div className="flex items-center gap-1 text-default-500">
                            <IoLocationOutline size={16} className="text-primary" />
                            <span className="text-xs font-medium">
                              {dest.city}, {dest.country}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-warning-50 text-warning-600 px-2 py-1 rounded-full">
                          <IoStar size={14} />
                          <span className="text-xs font-bold">
                            {dest.averageRating || "4.8"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-default-600 line-clamp-2 min-h-[40px]">
                        {dest.description}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="shadow"
                          className="flex-1 font-bold"
                        >
                          Explore Now
                        </Button>
                        {trips.length > 0 && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button size="sm" variant="flat" color={addedStatus[dest.id] ? "success" : "default"} isIconOnly>
                                {addedStatus[dest.id] ? <IoCheckmarkOutline size={18} /> : <IoAdd size={18} />}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Add to Trip" onAction={(key) => handleAddToTrip(dest.id, String(key))}>
                              {trips.map((trip) => (
                                <DropdownItem key={trip.id}>{trip.name}</DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 opacity-60 gap-4">
              <IoHeartOutline size={64} className="text-default-300" />
              <p className="text-lg">You haven't saved any destinations yet.</p>
              <Link to="/search">
                <Button color="primary" variant="flat">
                  Discover Destinations
                </Button>
              </Link>
            </div>
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

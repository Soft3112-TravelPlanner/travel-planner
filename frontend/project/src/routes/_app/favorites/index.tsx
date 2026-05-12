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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
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
import { motion, AnimatePresence } from "framer-motion";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";
import { useEffect } from "react";

export const Route = createFileRoute('/_app/favorites/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  // Ekleme Modalı State'leri
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const [pendingAdd, setPendingAdd] = useState<{ destId: string | number, tripId: string } | null>(null);
  const [addDay, setAddDay] = useState("0");
  const [addTime, setAddTime] = useState("");
  const [addDuration, setAddDuration] = useState("");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'danger' } | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);

  const favoriteDestinations = useMemo(() => {
    return destinations.filter((dest) => favorites.includes(String(dest.id)));
  }, [favorites]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("travel-planner-profile");
        const token = stored ? JSON.parse(stored).token : null;
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const destRes = await fetch("http://localhost:3001/api/destinations", { headers: authHeader });
        if (destRes.ok) {
          const data = await destRes.json();
          setDestinations(data);
        }

        if (token) {
          const tripsRes = await fetch("http://localhost:3001/api/trips", { headers: authHeader });
          if (tripsRes.ok) {
            const tripsData = await tripsRes.json();
            const mappedTrips = tripsData.map((t: any) => ({
              ...t,
              id: String(t.id),
              startDate: t.start_date || t.startDate,
              endDate: t.end_date || t.endDate,
              destinationId: String(t.destination_id || t.destinationId),
              plannedActivities: typeof t.planned_activities === 'string' ? JSON.parse(t.planned_activities) : (t.planned_activities || t.plannedActivities || [])
            }));
            setTrips(mappedTrips);
          }

          const favsRes = await fetch("http://localhost:3001/api/favorites", { headers: authHeader });
          if (favsRes.ok) {
            const favsData = await favsRes.json();
            setFavorites(favsData.map(String));
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = async (id: string | number) => {
    const strId = String(id);
    const stored = localStorage.getItem("travel-planner-profile");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) return;

    setTogglingFav(strId);
    try {
      const response = await fetch(`http://localhost:3001/api/favorites/toggle/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.isFavorite) {
          setFavorites(prev => [...prev, strId]);
          setShowToast({ message: "Added to favorites!", type: "success" });
        } else {
          setFavorites(prev => prev.filter(fid => fid !== strId));
          setShowToast({ message: "Removed from favorites", type: "danger" });
        }
        setTimeout(() => setShowToast(null), 3000);
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    } finally {
      setTogglingFav(null);
    }
  };

  const getTripDays = (trip: any) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return Array.from({ length: diffDays }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        index: i,
        label: `Day ${i + 1} (${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`
      };
    });
  };

  const handleInitiateAdd = (destId: string | number, tripId: string) => {
    setPendingAdd({ destId, tripId });
    setAddDay("0");
    setAddTime("");
    setAddDuration("");
    onAddOpen();
  };

  const handleConfirmAdd = (onClose: () => void) => {
    if (!pendingAdd) return;
    const { destId, tripId } = pendingAdd;
    const dest = destinations.find(d => String(d.id) === String(destId));
    if (!dest) return;

    const targetTrip = trips.find(t => String(t.id) === String(tripId));
    if (!targetTrip) return;

    const newActivity = {
      id: Date.now().toString(),
      title: dest.name,
      startTime: addTime,
      duration: addDuration,
      dayIndex: Number(addDay),
      lat: dest.coordinates.lat,
      lng: dest.coordinates.lng,
    };

    const updatedActivities = [...(targetTrip.plannedActivities || []), newActivity].sort((a, b) => 
      (a.startTime || "24:00").localeCompare(b.startTime || "24:00")
    );

    const updatedTrip = { ...targetTrip, plannedActivities: updatedActivities };

    const saveToBackend = async () => {
      try {
        const stored = localStorage.getItem("travel-planner-profile");
        const token = stored ? JSON.parse(stored).token : null;

        const response = await fetch(`http://localhost:3001/api/trips/${tripId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTrip),
        });

        if (response.ok) {
          const tripsRes = await fetch("http://localhost:3001/api/trips", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (tripsRes.ok) {
            const allTrips = await tripsRes.json();
            setTrips(allTrips);
          }
          setAddedStatus((prev) => ({ ...prev, [destId]: true }));
          setTimeout(() => setAddedStatus((prev) => ({ ...prev, [destId]: false })), 2000);
          onClose();
        }
      } catch (err) {
        console.error("Failed to add activity:", err);
      }
    };
    saveToBackend();
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
                            isLoading={togglingFav === String(dest.id)}
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
                                onAction={(key) => handleInitiateAdd(dest.id, String(key))}
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

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border-2 ${
              showToast.type === 'success' 
                ? 'bg-success/90 border-success-200 text-white' 
                : 'bg-danger/90 border-danger-200 text-white'
            }`}>
              {showToast.type === 'success' ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
              <span className="font-bold italic">{showToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Activity Modal */}
      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange} placement="center" backdrop="blur">
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => {
            const trip = trips.find(t => t.id === pendingAdd?.tripId);
            const dest = destinations.find(d => String(d.id) === String(pendingAdd?.destId));
            const tripDays = trip ? getTripDays(trip) : [];

            return (
              <>
                <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic">
                  Add to {trip?.name}
                </ModalHeader>
                <ModalBody className="px-6 py-4 flex flex-col gap-5">
                  <p className="text-default-500 text-sm">When do you want to visit <strong>{dest?.name}</strong>?</p>
                  
                  <Select
                    label="Select Day"
                    variant="bordered"
                    selectedKeys={[addDay]}
                    onSelectionChange={(keys) => setAddDay(Array.from(keys)[0] as string)}
                    classNames={{ trigger: "rounded-xl bg-background" }}
                  >
                    {tripDays.map((day) => (
                      <SelectItem key={day.index.toString()} textValue={day.label}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="time" label="Start Time (Optional)" variant="bordered" value={addTime} onValueChange={setAddTime} classNames={{ inputWrapper: "rounded-xl bg-background" }} />
                    <Input label="Duration" placeholder="e.g. 2h 30m" variant="bordered" value={addDuration} onValueChange={setAddDuration} classNames={{ inputWrapper: "rounded-xl bg-background" }} />
                  </div>
                </ModalBody>
                <ModalFooter className="px-6 pb-6">
                  <Button color="danger" variant="light" onPress={onClose} className="font-bold">Cancel</Button>
                  <Button color="primary" onPress={() => handleConfirmAdd(onClose)} className="font-bold rounded-xl shadow-lg">
                    Add to Itinerary
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}

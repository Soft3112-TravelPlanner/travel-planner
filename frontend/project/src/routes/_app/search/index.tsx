import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Input,
  Card,
  CardHeader,
  CardBody,
  Image,
  Button,
  Chip,
  useDisclosure,
  Slider,
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
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

// React Icons
import {
  IoMap,
  IoCafeOutline,
  IoFootstepsOutline,
  IoPeopleOutline,
  IoLibraryOutline,
  IoHourglassOutline,
  IoRestaurantOutline,
  IoBagHandleOutline,
  IoHeartOutline,
  IoCompassOutline,
  IoSearchOutline,
  IoLocationOutline,
  IoStar,
  IoHeart,
  IoAdd,
  IoCheckmarkOutline,
  IoFilterOutline,
} from "react-icons/io5";
import { getAllDestinations } from "@/utils/destinations";
import { MOODS } from "@/data";
import { REVIEWS_STORAGE_KEY } from "@/constants/storage";
import { DestinationModal } from "@/components/destinationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { getAuthToken } from "@/utils";
import type { Destination } from "@/interfaces";

export const Route = createFileRoute("/_app/search/")({
  component: SearchComponent,
});

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("travel-planner-profile");
        const token = stored ? JSON.parse(stored).token : null;
        
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch Destinations
        const destRes = await fetch("http://localhost:3001/api/destinations", {
          headers: authHeader
        });
        if (destRes.ok) {
          const data = await destRes.json();
          setDestinations(data);
        }

        // Fetch Trips
        if (token) {
          const tripsRes = await fetch("http://localhost:3001/api/trips", {
            headers: authHeader
          });
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
        }

        // Fetch Favorites
        if (token) {
          const favsRes = await fetch("http://localhost:3001/api/favorites", {
            headers: authHeader
          });
          if (favsRes.ok) {
            const favsData = await favsRes.json();
            setFavorites(favsData.map(String));
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Bütçe Aralığı State'i: [minValue, maxValue]
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 100000]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  // Ekleme Modalı State'leri
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();
  const [pendingAdd, setPendingAdd] = useState<{
    destId: string | number;
    tripId: string;
  } | null>(null);
  const [addDay, setAddDay] = useState("0");
  const [addTime, setAddTime] = useState("");
  const [addDuration, setAddDuration] = useState("");

  // Gezileri API'den çek
  const [trips, setTrips] = useState<any[]>([]);
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'danger' } | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);

  const [reviews, setReviews] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = async (id: string | number) => {
    const strId = String(id);
    const token = getAuthToken();
    if (!token) {
      alert("Please login to manage favorites.");
      return;
    }

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
        label: `Day ${i + 1} (${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })})`,
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

    let title = "";
    let lat: number | undefined;
    let lng: number | undefined;

    if (destId.toString().startsWith("custom_") && customItemToAdd) {
      title = customItemToAdd.name;
      lat = customItemToAdd.lat;
      lng = customItemToAdd.lng;
    } else {
      const dest = destinations.find((d) => String(d.id) === String(destId));
      if (!dest) return;
      title = dest.name;
      lat = dest.coordinates.lat;
      lng = dest.coordinates.lng;
    }

    const targetTrip = trips.find((t) => String(t.id) === String(tripId));
    if (!targetTrip) return;

    const plannedActivities = targetTrip.plannedActivities || [];
    const newActivity = {
      id: Date.now().toString(),
      title: title,
      startTime: addTime,
      duration: addDuration,
      dayIndex: Number(addDay),
      lat: lat,
      lng: lng,
    };

    const updatedActivities = [...plannedActivities, newActivity].sort((a, b) =>
      (a.startTime || "24:00").localeCompare(b.startTime || "24:00"),
    );

    const updatedTrip = {
      ...targetTrip,
      plannedActivities: updatedActivities,
    };

    const fetchUpdatedTrips = async () => {
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
          // Update local state by fetching all trips again
          const tripsRes = await fetch("http://localhost:3001/api/trips", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (tripsRes.ok) {
            const allTrips = await tripsRes.json();
            setTrips(allTrips);
          }

          if (!destId.toString().startsWith("custom_")) {
            setAddedStatus((prev) => ({ ...prev, [destId]: true }));
            setTimeout(
              () => setAddedStatus((prev) => ({ ...prev, [destId]: false })),
              2000,
            );
          }
          setCustomItemToAdd(null);
          onClose();
        } else {
          alert("Failed to add activity to trip.");
        }
      } catch (err) {
        console.error("Failed to add activity:", err);
        alert("An error occurred while adding the activity.");
      }
    };

    fetchUpdatedTrips();
  };

  const handleQuickAdd = (item: {
    name: string;
    lat?: number;
    lng?: number;
  }) => {
    // We need to know which trip to add to.
    // If there's only one trip, we can default to it.
    // Otherwise, we might need a way to select a trip.
    // For simplicity, if there's only one trip, we use it. If more, we use the first one or ask.
    // Given the context of "Quick Add", let's use the first trip found or show the same selection if needed.
    // Actually, I'll repurpose handleInitiateAdd to work with custom names/coords.

    // Create a pseudo-destination ID for the item or just pass the data
    const mockDestId = `custom_${item.name}_${Date.now()}`;
    // Store custom item data temporarily if needed, but handleInitiateAdd currently uses `destinations.find`.
    // I should modify handleInitiateAdd and handleConfirmAdd to support custom items.

    setCustomItemToAdd(item);
    if (trips.length === 1) {
      handleInitiateAdd(mockDestId, trips[0].id);
    } else if (trips.length > 1) {
      // If multiple trips, we need to know which one.
      // I'll add a state to track that we are adding a custom item.
      setPendingCustomAdd(item);
    } else {
      alert("Please create a trip first!");
    }
  };

  const [customItemToAdd, setCustomItemToAdd] = useState<{
    name: string;
    lat?: number;
    lng?: number;
  } | null>(null);
  const [pendingCustomAdd, setPendingCustomAdd] = useState<{
    name: string;
    lat?: number;
    lng?: number;
  } | null>(null);

  const handleOpenModal = (dest: Destination) => {
    setSelectedDest(dest);
    onOpen();
  };

  const filteredDestinations = useMemo(() => {
    let result = destinations;

    if (debouncedQuery.trim()) {
      const lowerQuery = debouncedQuery.toLowerCase();
      result = result.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerQuery) ||
          dest.city.toLowerCase().includes(lowerQuery) ||
          dest.country.toLowerCase().includes(lowerQuery),
      );
    }

    result = result.filter(
      (dest) =>
        dest.estimatedBudget >= budgetRange[0] &&
        dest.estimatedBudget <= budgetRange[1],
    );

    if (selectedMoods.length > 0) {
      result = result.filter((dest) =>
        selectedMoods.every((mood) => dest.moods?.includes(mood)),
      );
    }

    return result;
  }, [debouncedQuery, budgetRange, selectedMoods, destinations]);

  return (
    <>
      <div className="flex-1 flex flex-col gap-12 p-6 max-w-7xl mx-auto w-full pb-20">
        {/* Search Header */}
        <section className="flex flex-col gap-6 items-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight italic">
              Explore the <span className="text-primary not-italic">World</span>
            </h1>
            <p className="text-default-500 max-w-lg mx-auto">
              Find the perfect destinations matching your style and budget.
            </p>
          </motion.div>

          <div className="w-full max-w-3xl mt-4 flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onValueChange={setSearchQuery}
                isClearable
                radius="full"
                size="lg"
                placeholder="Where to next? (e.g. Istanbul, Tokyo, Rome)"
                startContent={
                  <IoSearchOutline
                    size={24}
                    className="text-primary flex-shrink-0"
                  />
                }
                classNames={{
                  inputWrapper:
                    "bg-background border-2 border-divider shadow-md hover:border-primary/50 focus-within:!border-primary transition-all px-6 h-16",
                  input: "text-lg",
                }}
              />
              <Button
                isIconOnly
                radius="full"
                size="lg"
                variant={showFilters ? "solid" : "bordered"}
                color={showFilters ? "primary" : "default"}
                className="h-16 w-16 border-2"
                onPress={() => setShowFilters(!showFilters)}
                aria-label="Toggle Filters"
              >
                <div className="relative">
                  <IoFilterOutline size={24} />
                  {(budgetRange[0] > 0 || budgetRange[1] < 100000 || selectedMoods.length > 0) && (
                    <span className="absolute -top-2 -right-2 w-3 h-3 bg-danger rounded-full border-2 border-background" />
                  )}
                </div>
              </Button>
            </div>

            {/* Mood Quick Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x">
              {MOODS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                const Icon = {
                  Adventure: IoCompassOutline,
                  Relaxing: IoCafeOutline,
                  Family: IoPeopleOutline,
                  Cultural: IoLibraryOutline,
                  History: IoHourglassOutline,
                  Foodie: IoRestaurantOutline,
                  Shopping: IoBagHandleOutline,
                  Romantic: IoHeartOutline,
                }[mood] || IoCompassOutline;

                return (
                  <Button
                    key={mood}
                    variant={isSelected ? "solid" : "flat"}
                    color={isSelected ? "primary" : "default"}
                    radius="full"
                    className={`font-bold flex-shrink-0 snap-start h-12 px-6 ${
                      !isSelected ? "bg-background border-2 border-divider hover:border-primary/50" : "shadow-lg shadow-primary/30"
                    }`}
                    startContent={<Icon size={20} />}
                    onPress={() => {
                      setSelectedMoods(prev => 
                        prev.includes(mood) 
                          ? prev.filter(m => m !== mood) 
                          : [...prev, mood]
                      );
                    }}
                  >
                    {mood}
                  </Button>
                );
              })}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-default-50 border-none shadow-inner p-6 mt-2">
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold uppercase tracking-wider text-default-600">
                          Budget Range
                        </span>
                        <Chip
                          variant="flat"
                          color="primary"
                          className="font-mono"
                        >
                          ${budgetRange[0]} - ${budgetRange[1]}
                        </Chip>
                      </div>
                      <Slider
                        step={100}
                        minValue={0}
                        maxValue={20000}
                        value={budgetRange}
                        onChange={(v) => setBudgetRange(v as [number, number])}
                        color="primary"
                        size="md"
                        classNames={{
                          track: "bg-default-200",
                          thumb: "bg-primary shadow-lg ring-2 ring-background",
                        }}
                      />
                      <div className="flex justify-between text-xs text-default-400 font-bold">
                        <span>$0</span>
                        <span>$10,000</span>
                        <span>$20,000+</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Results Section */}
        <section className="flex flex-col gap-8">
          <div className="flex justify-between items-end border-b-2 border-divider pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold italic">
                {searchQuery ? "Search Results" : "Top Destinations"}
              </h2>
              <p className="text-sm text-default-400">
                Showing {filteredDestinations.length} matching locations
              </p>
            </div>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((dest, index) => {
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

                        {/* Tags */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                          <Button
                            isIconOnly
                            radius="full"
                            size="sm"
                            isLoading={togglingFav === String(dest.id)}
                            className={`backdrop-blur-md shadow-lg transition-colors ${
                              isFavorite
                                ? "bg-danger text-white"
                                : "bg-white/80 text-black hover:bg-white"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(dest.id);
                            }}
                          >
                            {isFavorite ? (
                              <IoHeart size={18} />
                            ) : (
                              <IoHeartOutline size={18} />
                            )}
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
                                  color={
                                    addedStatus[dest.id] ? "success" : "default"
                                  }
                                  isIconOnly
                                  className="rounded-2xl"
                                >
                                  {addedStatus[dest.id] ? (
                                    <IoCheckmarkOutline size={20} />
                                  ) : (
                                    <IoAdd size={20} />
                                  )}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Add to Trip"
                                onAction={(key) =>
                                  handleInitiateAdd(dest.id, String(key))
                                }
                              >
                                {trips.map((trip) => (
                                  <DropdownItem
                                    key={trip.id}
                                    startContent={<IoMap size={18} />}
                                  >
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
                <IoSearchOutline size={48} className="text-default-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No matching destinations
              </h3>
              <p className="text-default-500 max-w-sm">
                Try adjusting your filters or searching for something else to
                find your next adventure.
              </p>
              <Button
                variant="light"
                color="primary"
                className="mt-4 font-bold"
                onPress={() => {
                  setSearchQuery("");
                  setBudgetRange([0, 100000]);
                  setSelectedMoods([]);
                }}
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </section>
      </div>

      <DestinationModal
        destination={selectedDest}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onQuickAdd={handleQuickAdd}
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
      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => {
            const trip = trips.find((t) => t.id === pendingAdd?.tripId);
            const isCustom = pendingAdd?.destId
              .toString()
              .startsWith("custom_");
            const itemName = isCustom
              ? customItemToAdd?.name
              : destinations.find(
                  (d) => String(d.id) === String(pendingAdd?.destId),
                )?.name;
            const tripDays = trip ? getTripDays(trip) : [];

            return (
              <>
                <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic">
                  Add to {trip?.name}
                </ModalHeader>
                <ModalBody className="px-6 py-4 flex flex-col gap-5">
                  <p className="text-default-500 text-sm">
                    When do you want to visit <strong>{itemName}</strong>?
                  </p>

                  <Select
                    label="Select Day"
                    variant="bordered"
                    selectedKeys={[addDay]}
                    onSelectionChange={(keys) =>
                      setAddDay(Array.from(keys)[0] as string)
                    }
                    classNames={{ trigger: "rounded-xl bg-background" }}
                  >
                    {tripDays.map((day) => (
                      <SelectItem
                        key={day.index.toString()}
                        textValue={day.label}
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="time"
                      label="Start Time (Optional)"
                      variant="bordered"
                      value={addTime}
                      onValueChange={setAddTime}
                      classNames={{ inputWrapper: "rounded-xl bg-background" }}
                    />
                    <Input
                      label="Duration"
                      placeholder="e.g. 2h 30m"
                      variant="bordered"
                      value={addDuration}
                      onValueChange={setAddDuration}
                      classNames={{ inputWrapper: "rounded-xl bg-background" }}
                    />
                  </div>
                </ModalBody>
                <ModalFooter className="px-6 pb-6">
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => handleConfirmAdd(onClose)}
                    className="font-bold rounded-xl shadow-lg"
                  >
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

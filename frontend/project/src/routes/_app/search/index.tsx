import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Input,
  Card,
  Button,
  Chip,
  useDisclosure,
  Slider,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import { IoFilterOutline, IoSearchOutline } from "react-icons/io5";
import { destinations } from "@/data";
import { useDebounce } from "@/hooks/useDebounce";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";
import { DestinationCard } from "@/components/DestinationCard";
import { useDestinationCollections } from "@/hooks/useDestinationCollections";

export const Route = createFileRoute("/_app/search/")({
  component: SearchComponent,
});

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Bütçe Aralığı State'i: [minValue, maxValue]
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  // Shared browser-backed trip and favorite state.
  const { addedStatus, addToTrip, favorites, toggleFavorite, trips } =
    useDestinationCollections();

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

    return result;
  }, [debouncedQuery, budgetRange]);

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
                  inputWrapper: "bg-background border-2 border-divider shadow-md hover:border-primary/50 focus-within:!border-primary transition-all px-6 h-16",
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
              >
                <IoFilterOutline size={24} />
              </Button>
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
                        <Chip variant="flat" color="primary" className="font-mono">
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
              {filteredDestinations.map((dest, index) => (
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
                <IoSearchOutline size={48} className="text-default-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No matching destinations</h3>
              <p className="text-default-500 max-w-sm">
                Try adjusting your filters or searching for something else to find your next adventure.
              </p>
              <Button 
                variant="light" 
                color="primary" 
                className="mt-4 font-bold"
                onPress={() => {
                  setSearchQuery("");
                  setBudgetRange([0, 20000]);
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
      />
    </>
  );
}

import { useState, useMemo } from "react";
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
} from "@heroui/react";

// React Icons importları (Ionicons 5 setini kullandım)
import { IoSearchOutline, IoLocationOutline, IoStar } from "react-icons/io5";
import { destinations } from "@/data";
import { useDebounce } from "@/hooks/useDebounce";
import type { Destination } from "@/interfaces";
import { DestinationModal } from "@/components/destinationModal";

export const Route = createFileRoute("/_app/search/")({
  component: SearchComponent,
});

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const handleOpenModal = (dest: Destination) => {
    setSelectedDest(dest);
    onOpen();
  };

  const filteredDestinations = useMemo(() => {
    if (!debouncedQuery.trim()) return destinations;

    const lowerQuery = debouncedQuery.toLowerCase();
    return destinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(lowerQuery) ||
        dest.city.toLowerCase().includes(lowerQuery) ||
        dest.country.toLowerCase().includes(lowerQuery),
    );
  }, [debouncedQuery]);

  return (
    <>
      {" "}
      <div className="flex-1 flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
        {/* Search Header */}
        <section className="flex flex-col gap-4 items-center text-center mt-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Explore the World
          </h1>
          <p className="text-default-500 max-w-lg">
            Find the best landmarks and restaurants for your next trip.
          </p>

          <div className="w-full max-w-2xl mt-4">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              isClearable
              radius="lg"
              placeholder="Search city, country or place..."
              startContent={
                <IoSearchOutline
                  size={20}
                  className="text-default-400 flex-shrink-0"
                />
              }
              classNames={{
                inputWrapper:
                  "shadow-sm bg-default-100 hover:bg-default-200 focus-within:!bg-default-100 transition-background",
              }}
            />
          </div>
        </section>

        {/* Results Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-divider pb-4">
            <h2 className="text-xl font-semibold">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "Popular Destinations"}
            </h2>
            <Chip variant="dot" color="primary" size="sm">
              {filteredDestinations.length} found
            </Chip>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((dest) => (
                <Card
                  key={dest.id}
                  isPressable
                  className=" group border-none bg-background/60 dark:bg-default-100/50"
                  onPress={() => handleOpenModal(dest)} // Karta basınca modalı aç
                >
                  <CardHeader className="p-0  overflow-hidden">
                    <Image
                      alt={dest.name}
                      classNames={{
                        // Wrapper'ın genişliğini ve resmin kapsama şeklini garantiye alıyoruz
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
                          <IoLocationOutline
                            size={16}
                            className="text-primary"
                          />
                          <span className="text-xs font-medium">
                            {dest.city}, {dest.country}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-warning-50 text-warning-600 px-2 py-1 rounded-full">
                        <IoStar size={14} />
                        <span className="text-xs font-bold">4.8</span>
                      </div>
                    </div>

                    <p className="text-sm text-default-600 line-clamp-2 min-h-[40px]">
                      {dest.description}
                    </p>

                    <Button
                      size="sm"
                      color="primary"
                      variant="shadow"
                      className="w-full font-bold"
                    >
                      Explore Now
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 opacity-60">
              <IoSearchOutline size={48} className="mb-4 text-default-300" />

              <p className="text-lg">
                We couldn't find what you're looking for.
              </p>
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

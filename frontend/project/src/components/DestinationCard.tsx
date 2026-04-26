import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  IoAdd,
  IoCheckmarkOutline,
  IoHeart,
  IoHeartOutline,
  IoLocationOutline,
  IoMap,
  IoStar,
} from "react-icons/io5";
import type { Destination, Trip } from "@/interfaces";

type DestinationCardProps = Readonly<{
  destination: Destination;
  index: number;
  isFavorite: boolean;
  trips: Trip[];
  isAddedToTrip: boolean;
  onOpen: (destination: Destination) => void;
  onToggleFavorite: (destinationId: Destination["id"]) => void;
  onAddToTrip: (destinationId: Destination["id"], tripId: Trip["id"]) => void;
}>;

export function DestinationCard({
  destination,
  index,
  isFavorite,
  trips,
  isAddedToTrip,
  onOpen,
  onToggleFavorite,
  onAddToTrip,
}: DestinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        isPressable
        className="group border-none bg-background hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden"
        onPress={() => onOpen(destination)}
      >
        <div className="relative h-[280px] w-full overflow-hidden">
          <Image
            alt={destination.name}
            src={destination.mainImageUrl}
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
                isFavorite
                  ? "bg-danger text-white"
                  : "bg-white/80 text-black hover:bg-white"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(destination.id);
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
              ${destination.estimatedBudget}
            </Chip>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1 text-white text-sm font-medium">
              <IoLocationOutline size={16} />
              {destination.city}, {destination.country}
            </div>
          </div>
        </div>

        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold italic group-hover:text-primary transition-colors">
              {destination.name}
            </h3>
            <div className="flex items-center gap-1 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-xs font-black">
              <IoStar size={14} />
              {destination.averageRating || "4.8"}
            </div>
          </div>

          <p className="text-default-500 text-sm line-clamp-2 mb-6 leading-relaxed">
            {destination.description}
          </p>

          <div className="flex gap-3">
            <Button
              color="primary"
              className="flex-1 font-bold rounded-2xl shadow-lg shadow-primary/20"
              onPress={() => onOpen(destination)}
            >
              Explore
            </Button>
            {trips.length > 0 && (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    color={isAddedToTrip ? "success" : "default"}
                    isIconOnly
                    className="rounded-2xl"
                  >
                    {isAddedToTrip ? (
                      <IoCheckmarkOutline size={20} />
                    ) : (
                      <IoAdd size={20} />
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Add to Trip"
                  onAction={(key) => onAddToTrip(destination.id, String(key))}
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
}

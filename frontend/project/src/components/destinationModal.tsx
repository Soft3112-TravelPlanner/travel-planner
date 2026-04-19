import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Chip,
  Divider,
  ScrollShadow,
} from "@heroui/react";

// React Icons
import {
  IoLocationOutline,
  IoRestaurantOutline,
  IoFlagOutline,
  IoStar,
  IoMapOutline,
  IoWalletOutline, // Bütçe ikonu eklendi
} from "react-icons/io5";

// Leaflet bileşenleri
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Tip tanımı
import type { Destination } from "@/interfaces";

// 1. Leaflet İkon Fix
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 2. Yardımcı Bileşen: Koordinat değişince haritayı kaydırır ve boyutunu düzeltir
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
    // Modal açılış animasyonu haritayı bozmasın diye yeniden boyutlandırma tetikleyicisi
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timeout);
  }, [center, map]);
  return null;
}

// 3. Küçük Harita Bileşeni
const MapSection = ({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) => {
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-[250px] rounded-2xl overflow-hidden border-2 border-divider shadow-sm relative z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// 4. ANA MODAL BİLEŞENİ
interface Props {
  destination: Destination | null;
  isOpen: boolean;
  onOpenChange: () => void;
}

export const DestinationModal = ({
  destination,
  isOpen,
  onOpenChange,
}: Props) => {
  if (!destination) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "dark:bg-[#121212] bg-white",
        header: "border-b-[1px] border-divider",
        footer: "border-t-[1px] border-divider",
        closeButton: "hover:bg-default-200 z-50", // Çarpı butonu üstte kalsın diye
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* Header Kısmı Güncellendi (Bütçe Eklendi) */}
            <ModalHeader className="flex flex-col gap-1 pr-12">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-2xl font-bold">{destination.name}</h2>
                <Chip
                  color="success"
                  variant="flat"
                  size="md"
                  className="font-bold tracking-wide"
                  startContent={<IoWalletOutline size={16} />}
                >
                  Est. ${destination.estimatedBudget}
                </Chip>
              </div>
              <div className="flex items-center gap-1 text-default-500 font-normal text-sm">
                <div className="text-primary">
                  <IoLocationOutline size={18} />
                </div>
                {destination.city}, {destination.country}
              </div>
            </ModalHeader>

            <ModalBody className="p-0">
              <ScrollShadow className="w-full max-h-[75vh]">
                {/* Hero Image */}
                <Image
                  src={destination.mainImageUrl}
                  alt={destination.name}
                  className="w-full h-[300px] object-cover rounded-none"
                  width="100%"
                />

                <div className="p-6 flex flex-col gap-8">
                  {/* Hakkında */}
                  <section>
                    <h4 className="text-lg font-semibold mb-2">Overview</h4>
                    <p className="text-default-600 leading-relaxed">
                      {destination.description}
                    </p>
                  </section>

                  {/* Harita Bölümü */}
                  <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-primary">
                        <IoMapOutline size={22} />
                      </div>
                      <h4 className="text-lg font-semibold">Location</h4>
                    </div>
                    <MapSection
                      lat={destination.coordinates.lat}
                      lng={destination.coordinates.lng}
                      name={destination.name}
                    />
                  </section>

                  <Divider />

                  {/* Landmarklar */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-secondary">
                        <IoFlagOutline size={22} />
                      </div>
                      <h4 className="text-lg font-semibold">
                        Famous Landmarks
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {destination.landmarks.map((landmark) => (
                        <div
                          key={landmark.id}
                          className="p-4 rounded-xl bg-default-50 border border-divider hover:border-primary/40 transition-colors"
                        >
                          <p className="font-bold text-sm text-primary">
                            {landmark.name}
                          </p>
                          <p className="text-xs text-default-500 mt-1">
                            {landmark.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Restoranlar */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-success">
                        <IoRestaurantOutline size={22} />
                      </div>
                      <h4 className="text-lg font-semibold">Where to Eat</h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {destination.localRestaurants.map((restaurant) => (
                        <div
                          key={restaurant.id}
                          className="flex justify-between items-center p-4 border border-divider rounded-2xl hover:bg-default-50 transition-all"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="font-bold text-md">
                              {restaurant.name}
                            </p>
                            <p className="text-xs text-default-500">
                              {restaurant.cuisine} • {restaurant.address}
                            </p>
                            <div className="flex items-center gap-1 text-warning mt-1">
                              <IoStar size={14} />
                              <span className="text-xs font-bold">
                                {restaurant.rating}
                              </span>
                            </div>
                          </div>
                          <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            className="font-bold"
                          >
                            {restaurant.priceRange}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollShadow>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                variant="shadow"
                onPress={() =>
                  // Google Maps Yol Tarifi linki düzeltildi
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates.lat},${destination.coordinates.lng}`,
                    "_blank",
                  )
                }
                startContent={<IoMapOutline size={18} />}
              >
                Directions
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

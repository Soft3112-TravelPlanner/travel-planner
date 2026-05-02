import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Chip,
  Card,
  CardBody,
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
  IoStarOutline,
  IoChatbubblesOutline,
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

  // Yorumları State'te tutuyoruz
  const [reviews, setReviews] = useState<any[]>([]);

  // Modal her açıldığında yorumları localStorage'dan güncel çek
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem("travel-planner-reviews");
        if (stored) setReviews(JSON.parse(stored));
      } catch {
        setReviews([]);
      }
    }
  }, [isOpen]);

  // Sadece şu anki destinasyonun yorumlarını filtrele
  const destinationReviews = reviews.filter(r => String(r.destinationId) === String(destination.id));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-background shadow-2xl rounded-[3rem] overflow-hidden border-none max-h-[90vh]",
        header: "border-b-2 border-divider/50 px-8 py-6",
        footer: "border-t-2 border-divider/50 px-8 py-6",
        closeButton: "hover:bg-default-200 z-50 top-6 right-6 p-2 rounded-full",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pr-16 bg-background/80 backdrop-blur-md sticky top-0 z-40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                <div>
                  <h2 className="text-3xl font-extrabold italic">{destination.name}</h2>
                  <div className="flex items-center gap-1 text-default-500 font-medium text-sm mt-1">
                    <IoLocationOutline size={18} className="text-primary" />
                    {destination.city}, {destination.country}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-3 py-1.5 rounded-2xl text-sm font-black">
                    <IoStar size={16} />
                    {destination.averageRating || "4.8"}
                  </div>
                  <Chip
                    color="success"
                    variant="flat"
                    size="lg"
                    className="font-black h-10 px-4 rounded-2xl border-none bg-success/10 text-success"
                    startContent={<IoWalletOutline size={18} />}
                  >
                    Est. ${destination.estimatedBudget}
                  </Chip>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-0">
              <ScrollShadow className="w-full" hideScrollBar>
                {/* Hero Image Section */}
                <div className="relative w-full h-[400px]">
                  <Image
                    src={destination.mainImageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover rounded-none"
                    removeWrapper
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="px-8 pb-12 flex flex-col gap-12 -mt-12 relative z-10">
                  {/* Overview Card */}
                  <Card className="border-none shadow-xl rounded-[2rem] p-4">
                    <CardBody>
                      <h4 className="text-xl font-bold italic mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        Overview
                      </h4>
                      <p className="text-default-600 leading-relaxed text-lg font-medium">
                        {destination.description}
                      </p>
                    </CardBody>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Map & Landmarks */}
                    <div className="flex flex-col gap-12">
                      <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <IoMapOutline size={24} />
                          </div>
                          <h4 className="text-xl font-bold italic">Location</h4>
                        </div>
                        <MapSection
                          lat={destination.coordinates.lat}
                          lng={destination.coordinates.lng}
                          name={destination.name}
                        />
                      </section>

                      <section>
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                            <IoFlagOutline size={24} />
                          </div>
                          <h4 className="text-xl font-bold italic"> Landmarks</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {destination.landmarks.map((landmark) => (
                            <div
                              key={landmark.id}
                              className="group p-5 rounded-3xl bg-default-50 border-2 border-transparent hover:border-primary/20 hover:bg-background hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-lg group-hover:text-primary transition-colors">
                                    {landmark.name}
                                  </p>
                                  <p className="text-sm text-default-500 font-medium mt-1">
                                    {landmark.type}
                                  </p>
                                </div>
                                <div className="p-2 bg-default-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                  <IoLocationOutline size={18} className="text-primary" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Right: Restaurants */}
                    <section>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-success/10 rounded-xl text-success">
                          <IoRestaurantOutline size={24} />
                        </div>
                        <h4 className="text-xl font-bold italic">Local Dining</h4>
                      </div>
                      <div className="flex flex-col gap-4">
                        {destination.localRestaurants.map((restaurant) => (
                          <div
                            key={restaurant.id}
                            className="group p-5 bg-default-50 border-2 border-transparent hover:border-success/20 hover:bg-background hover:shadow-lg rounded-[2rem] transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-lg group-hover:text-success transition-colors">
                                  {restaurant.name}
                                </p>
                                <p className="text-xs text-default-500 font-bold uppercase tracking-wider mt-1">
                                  {restaurant.cuisine}
                                </p>
                              </div>
                              <Chip
                                size="sm"
                                variant="flat"
                                color="success"
                                className="font-black px-3"
                              >
                                {restaurant.priceRange}
                              </Chip>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-divider/50">
                              <p className="text-xs text-default-400 font-medium italic">
                                {restaurant.address}
                              </p>
                              <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-1 rounded-lg">
                                <IoStar size={12} />
                                <span className="text-xs font-black">
                                  {restaurant.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Traveler Reviews Section */}
                  <section className="mt-4 border-t-2 border-divider/50 pt-12">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                          <IoStar size={28} />
                        </div>
                        <h4 className="text-2xl md:text-3xl font-extrabold italic">Traveler Reviews</h4>
                      </div>
                      <Chip variant="flat" color="primary" size="lg" className="font-bold rounded-2xl">
                        {destinationReviews.length} Reviews
                      </Chip>
                    </div>

                    <div className="flex flex-col gap-6">
                      {destinationReviews.length > 0 ? (
                        destinationReviews.map(review => (
                          <Card key={review.id} className="border-none bg-default-50 hover:bg-background hover:shadow-xl transition-all duration-300 rounded-[2.5rem]">
                            <CardBody className="p-8">
                              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-xl">
                                    {review.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-xl">{review.userName}</p>
                                    <p className="text-sm text-default-500 font-medium">
                                      {new Date(review.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 text-warning bg-warning/10 px-3 py-1.5 rounded-xl text-lg">
                                  {[...Array(5)].map((_, i) => (
                                    i < review.rating ? <IoStar key={i} /> : <IoStarOutline key={i} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-default-700 leading-relaxed text-lg font-medium mb-6">
                                {review.text}
                              </p>
                              {review.photos && review.photos.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                                  {review.photos.map((photo: string, i: number) => (
                                    <div key={i} className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-md snap-center">
                                      <Image src={photo} alt={`Review ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" removeWrapper />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-16 bg-default-50 rounded-[2.5rem] border-2 border-dashed border-divider">
                          <IoChatbubblesOutline size={64} className="mx-auto text-default-300 mb-4" />
                          <h5 className="text-xl font-bold mb-2">No reviews yet</h5>
                          <p className="text-default-500">Book a trip, experience this destination, and be the first to share your thoughts!</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </ScrollShadow>
            </ModalBody>

            <ModalFooter className="bg-background/80 backdrop-blur-md">
              <Button 
                variant="light" 
                className="font-bold px-8 h-12 rounded-2xl" 
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                color="primary"
                size="lg"
                className="font-bold px-10 h-12 rounded-2xl shadow-lg shadow-primary/20"
                onPress={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates.lat},${destination.coordinates.lng}`,
                    "_blank",
                  )
                }
                startContent={<IoMapOutline size={20} />}
              >
                Get Directions
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

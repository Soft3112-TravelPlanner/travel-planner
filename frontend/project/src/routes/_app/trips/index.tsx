import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Form,
} from "@heroui/react";
import {
  IoAdd,
  IoCalendarOutline,
  IoLocationOutline,
  IoAirplaneOutline,
  IoMapOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { destinations } from "@/data";

export const Route = createFileRoute('/_app/trips/')({
  component: RouteComponent,
});

interface Trip {
  id: string;
  name: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  itinerary?: string[];
}

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Gezileri tarayıcı hafızasından çek
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-trips");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Form gönderildiğinde yeni geziyi kaydet
  const onSubmit = (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTrip: Trip = {
      id: Date.now().toString(), // Benzersiz bir ID oluştur
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    onClose();
  };

  // Geziyi Düzenleme / Güncelleme
  const onEditSubmit = (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    if (!editingTrip) return;
    const formData = new FormData(e.currentTarget);
    
    const updatedTrip: Trip = {
      ...editingTrip,
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    const updatedTrips = trips.map(t => t.id === editingTrip.id ? updatedTrip : t);
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    onClose();
  };

  // Geziyi Silme
  const onDeleteTrip = (id: string, onClose: () => void) => {
    const updatedTrips = trips.filter((t) => t.id !== id);
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full mt-8">
      {/* Header Alanı */}
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Trips</h1>
          <p className="text-default-500 mt-1">
            Organize and manage your upcoming adventures.
          </p>
        </div>
        <Button
          color="primary"
          className="font-bold shadow-md"
          startContent={<IoAdd size={20} />}
          onPress={onOpen}
        >
          Create New Trip
        </Button>
      </section>

      {/* Gezilerin Listelendiği Alan */}
      <section>
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const dest = destinations.find((d) => String(d.id) === trip.destinationId);
              return (
                <Card key={trip.id} className="p-2 shadow-sm border border-divider/50 hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-col items-start gap-2 pb-0 px-4 pt-4">
                    <h3 className="text-xl font-bold line-clamp-1">{trip.name}</h3>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4 px-4 pb-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-default-600">
                        <IoLocationOutline size={18} className="text-primary flex-shrink-0" />
                        <span className="text-sm font-medium line-clamp-1">
                          {dest ? `${dest.name} (${dest.city})` : "Unknown Destination"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-default-600">
                        <IoCalendarOutline size={18} className="text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {trip.startDate} to {trip.endDate}
                        </span>
                      </div>
                      {trip.itinerary && trip.itinerary.length > 0 && (
                        <div className="flex items-center gap-2 text-default-600">
                          <IoMapOutline size={18} className="text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">
                            {trip.itinerary.length} destinations added
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      color="primary" 
                      variant="flat" 
                      className="w-full font-semibold mt-2"
                      onPress={() => {
                        setEditingTrip(trip);
                        onEditOpen();
                      }}
                    >
                      Organize Itinerary
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-60 gap-4">
            <IoAirplaneOutline size={64} className="text-default-300" />
            <p className="text-lg">You haven't created any trips yet.</p>
            <Button color="primary" variant="flat" onPress={onOpen}>
              Start Planning
            </Button>
          </div>
        )}
      </section>

      {/* Yeni Gezi Oluşturma Modalı */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <Form validationBehavior="native" onSubmit={(e) => onSubmit(e, onClose)}>
              <ModalHeader className="flex flex-col gap-1">Create a New Trip</ModalHeader>
              <ModalBody className="w-full flex flex-col gap-4">
                <Input autoFocus isRequired name="name" label="Trip Name" placeholder="e.g. Summer in Paris" variant="bordered" />
                
                <Select isRequired name="destinationId" label="Destination" placeholder="Where are you going?" variant="bordered">
                  {destinations.map((dest) => (
                    <SelectItem 
                      key={dest.id} 
                      value={String(dest.id)}
                      textValue={`${dest.name} (${dest.city}, ${dest.country})`}
                    >
                      {dest.name} ({dest.city}, {dest.country})
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex gap-4">
                  <Input isRequired name="startDate" label="Start Date" type="date" variant="bordered" placeholder=" " />
                  <Input isRequired name="endDate" label="End Date" type="date" variant="bordered" placeholder=" " />
                </div>
              </ModalBody>
              <ModalFooter className="w-full">
                <Button color="danger" variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="primary" type="submit">Create Trip</Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* Gezi Düzenleme (Edit) Modalı */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <Form validationBehavior="native" onSubmit={(e) => onEditSubmit(e, onClose)}>
              <ModalHeader className="flex flex-col gap-1">Organize / Edit Trip</ModalHeader>
              <ModalBody className="w-full flex flex-col gap-4">
                <Input isRequired name="name" label="Trip Name" defaultValue={editingTrip?.name} variant="bordered" />
                
                {editingTrip && (
                  <Select isRequired name="destinationId" label="Destination" defaultSelectedKeys={[editingTrip.destinationId]} variant="bordered">
                    {destinations.map((dest) => (
                      <SelectItem 
                        key={dest.id} 
                        value={String(dest.id)}
                        textValue={`${dest.name} (${dest.city}, ${dest.country})`}
                      >
                        {dest.name} ({dest.city}, {dest.country})
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <div className="flex gap-4">
                  <Input isRequired name="startDate" label="Start Date" type="date" defaultValue={editingTrip?.startDate} variant="bordered" placeholder=" " />
                  <Input isRequired name="endDate" label="End Date" type="date" defaultValue={editingTrip?.endDate} variant="bordered" placeholder=" " />
                </div>
              </ModalBody>
              <ModalFooter className="w-full flex justify-between">
                <Button color="danger" variant="light" isIconOnly onPress={() => onDeleteTrip(editingTrip!.id, onClose)}>
                  <IoTrashOutline size={20} />
                </Button>
                <div className="flex gap-2">
                  <Button color="default" variant="flat" onPress={onClose}>Cancel</Button>
                  <Button color="primary" type="submit">Save Changes</Button>
                </div>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

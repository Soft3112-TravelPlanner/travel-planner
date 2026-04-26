import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
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
  Chip,
} from "@heroui/react";
import {
  IoAdd,
  IoCalendarOutline,
  IoLocationOutline,
  IoAirplaneOutline,
  IoTrashOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";
import { destinations } from "@/data";
import type { Trip } from "@/interfaces";

export const Route = createFileRoute('/_app/trips/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-trips");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTrip: Trip = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      itinerary: [],
    };

    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    onClose();
  };

  const onEditSubmit = (e: FormEvent<HTMLFormElement>, onClose: () => void) => {
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

  const onDeleteTrip = (id: string, onClose: () => void) => {
    const updatedTrips = trips.filter((t) => t.id !== id);
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col gap-12 p-6 max-w-7xl mx-auto w-full pb-20">
      {/* Header Area */}
      <section className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 border-b-2 border-divider pb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight italic">
            My <span className="text-primary not-italic">Trips</span>
          </h1>
          <p className="text-default-500 mt-2">
            Organize and manage your upcoming adventures.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            color="primary"
            size="lg"
            className="font-bold shadow-lg shadow-primary/20 h-14 px-8 rounded-2xl"
            startContent={<IoAdd size={24} />}
            onPress={onOpen}
          >
            Create New Trip
          </Button>
        </motion.div>
      </section>

      {/* Trips List Area */}
      <section>
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, index) => {
              const dest = destinations.find((d) => String(d.id) === trip.destinationId);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    isPressable
                    className="group border-none bg-background hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] p-2"
                    onPress={() => {
                      setEditingTrip(trip);
                      onEditOpen();
                    }}
                  >
                    <div className="relative h-[200px] rounded-[2rem] overflow-hidden mb-4">
                      {dest ? (
                        <img 
                          src={dest.mainImageUrl} 
                          alt={dest.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-default-100 flex items-center justify-center">
                          <IoAirplaneOutline size={48} className="text-default-300" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Chip className="bg-white/90 backdrop-blur-md border-none font-bold text-black shadow-md">
                          {dest?.city || "Unknown"}
                        </Chip>
                      </div>
                    </div>

                    <CardBody className="px-6 pb-6 pt-0 flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-bold italic group-hover:text-primary transition-colors line-clamp-1">
                          {trip.name}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-3 py-2">
                        <div className="flex items-center gap-3 text-default-600">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <IoLocationOutline size={18} />
                          </div>
                          <span className="text-sm font-bold">
                            {dest ? dest.name : "Destination Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-default-600">
                          <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                            <IoCalendarOutline size={18} />
                          </div>
                          <span className="text-sm font-bold">
                            {trip.startDate} - {trip.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-divider">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-default-400 font-black">Itinerary</span>
                          <span className="text-sm font-bold text-primary">
                            {trip.itinerary?.length || 0} stops added
                          </span>
                        </div>
                        <Button 
                          isIconOnly 
                          variant="flat" 
                          color="primary" 
                          radius="full"
                          className="group-hover:translate-x-1 transition-transform"
                        >
                          <IoChevronForwardOutline size={20} />
                        </Button>
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
            <div className="bg-default-100 p-10 rounded-full mb-8">
              <IoAirplaneOutline size={64} className="text-default-300" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No trips planned yet</h3>
            <p className="text-default-500 max-w-sm mb-10 leading-relaxed">
              Start creating your dream itinerary and keep all your travel plans in one place.
            </p>
            <Button 
              color="primary" 
              size="lg"
              variant="shadow" 
              className="font-bold px-12 rounded-2xl"
              onPress={onOpen}
            >
              Start Planning
            </Button>
          </motion.div>
        )}
      </section>

      {/* New Trip Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <Form validationBehavior="native" onSubmit={(e) => onSubmit(e, onClose)}>
              <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                Create a New Trip
              </ModalHeader>
              <ModalBody className="w-full flex flex-col gap-6 py-4">
                <Input 
                  autoFocus 
                  isRequired 
                  name="name" 
                  label="Trip Name" 
                  placeholder="e.g. Summer in Paris" 
                  variant="bordered" 
                  className="font-bold"
                  classNames={{ inputWrapper: "rounded-2xl" }}
                />
                
                <Select 
                  isRequired 
                  name="destinationId" 
                  label="Destination" 
                  placeholder="Where are you going?" 
                  variant="bordered"
                  classNames={{ trigger: "rounded-2xl" }}
                >
                  {destinations.map((dest) => (
                    <SelectItem 
                      key={dest.id} 
                      textValue={`${dest.name} (${dest.city}, ${dest.country})`}
                    >
                      {dest.name} ({dest.city}, {dest.country})
                    </SelectItem>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input isRequired name="startDate" label="Start Date" type="date" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input isRequired name="endDate" label="End Date" type="date" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
              </ModalBody>
              <ModalFooter className="w-full flex gap-3 pt-6">
                <Button color="danger" variant="light" className="font-bold" onPress={onClose}>Cancel</Button>
                <Button color="primary" type="submit" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20">Create Trip</Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="center" backdrop="blur">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <Form validationBehavior="native" onSubmit={(e) => onEditSubmit(e, onClose)}>
              <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                Edit Trip Details
              </ModalHeader>
              <ModalBody className="w-full flex flex-col gap-6 py-4">
                <Input isRequired name="name" label="Trip Name" defaultValue={editingTrip?.name} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                
                {editingTrip && (
                  <Select isRequired name="destinationId" label="Destination" defaultSelectedKeys={[editingTrip.destinationId]} variant="bordered" classNames={{ trigger: "rounded-2xl" }}>
                    {destinations.map((dest) => (
                      <SelectItem 
                        key={dest.id} 
                        textValue={`${dest.name} (${dest.city}, ${dest.country})`}
                      >
                        {dest.name} ({dest.city}, {dest.country})
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input isRequired name="startDate" label="Start Date" type="date" defaultValue={editingTrip?.startDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input isRequired name="endDate" label="End Date" type="date" defaultValue={editingTrip?.endDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
              </ModalBody>
              <ModalFooter className="w-full flex justify-between pt-6">
                <Button color="danger" variant="flat" isIconOnly className="rounded-xl" onPress={() => onDeleteTrip(editingTrip!.id, onClose)}>
                  <IoTrashOutline size={22} />
                </Button>
                <div className="flex gap-3">
                  <Button color="default" variant="light" className="font-bold" onPress={onClose}>Cancel</Button>
                  <Button color="primary" type="submit" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20">Save Changes</Button>
                </div>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

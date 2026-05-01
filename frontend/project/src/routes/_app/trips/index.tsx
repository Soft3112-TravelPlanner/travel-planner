import { useState, useEffect } from "react";
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
  Divider,
  Progress,
  Checkbox,
} from "@heroui/react";
import {
  IoAdd,
  IoCalendarOutline,
  IoLocationOutline,
  IoAirplaneOutline,
  IoTrashOutline,
  IoChevronForwardOutline,
  IoBedOutline,
  IoMapOutline,
  IoTicketOutline,
  IoListOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";
import { destinations } from "@/data";

export const Route = createFileRoute('/_app/trips/')({
  component: RouteComponent,
});

interface Accommodation {
  hotelName: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationId: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

interface Transport {
  carrier: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  ticketFile?: string;
}

interface Trip {
  id: string;
  name: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  itinerary?: string[];
  accommodation?: Accommodation;
  transport?: Transport;
  checklist?: ChecklistItem[];
}

const PRESET_CHECKLIST = [
  "Check Visa Requirements",
  "Renew Passport",
  "Buy Travel Insurance",
  "Book Airport Transfer",
  "Pack Chargers",
];

function RouteComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isChecklistOpen, onOpen: onChecklistOpen, onOpenChange: onChecklistOpenChange } = useDisclosure();

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-trips");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [checklistTripId, setChecklistTripId] = useState<string | null>(null);
  const [customChecklistItem, setCustomChecklistItem] = useState("");

  const handleOpenChecklist = (tripId: string) => {
    setChecklistTripId(tripId);
    onChecklistOpen();
  };

  const handleToggleChecklistItem = (tripId: string, itemId: string, isDone: boolean) => {
    const updatedTrips = trips.map(t => {
      if (t.id === tripId) {
        return { ...t, checklist: t.checklist?.map(c => c.id === itemId ? { ...c, isDone } : c) };
      }
      return t;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
  };

  const handleAddChecklistItem = (tripId: string, text: string) => {
    if (!text.trim()) return;
    const updatedTrips = trips.map(t => {
      if (t.id === tripId) {
        const newChecklist = [...(t.checklist || []), { id: Date.now().toString(), text, isDone: false }];
        return { ...t, checklist: newChecklist };
      }
      return t;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setCustomChecklistItem("");
  };

  const handleDeleteChecklistItem = (tripId: string, itemId: string) => {
    const updatedTrips = trips.map(t => t.id === tripId ? { ...t, checklist: t.checklist?.filter(c => c.id !== itemId) } : t);
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
  };

  // Request notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Check for upcoming departures (3 hours before)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let updated = false;
      const notifiedTrips = JSON.parse(localStorage.getItem("notified-trips") || "{}");

      trips.forEach(trip => {
        if (trip.transport?.departureTime) {
          const depTime = new Date(trip.transport.departureTime).getTime();
          const threeHours = 3 * 60 * 60 * 1000;

          if (depTime - now <= threeHours && depTime > now && !notifiedTrips[trip.id]) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Upcoming Trip: ${trip.name}`, { 
                body: `${trip.transport.carrier} departs in less than 3 hours (Seat: ${trip.transport.seatNumber || 'N/A'}).` 
              });
            } else {
              alert(`Reminder: Your trip "${trip.name}" via ${trip.transport.carrier} departs in less than 3 hours!`);
            }
            notifiedTrips[trip.id] = true;
            updated = true;
          }
        }
      });

      if (updated) {
        localStorage.setItem("notified-trips", JSON.stringify(notifiedTrips));
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [trips]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const hotelName = formData.get("hotelName") as string;
    const accommodation = hotelName ? {
      hotelName,
      address: formData.get("hotelAddress") as string,
      checkInDate: formData.get("checkInDate") as string,
      checkOutDate: formData.get("checkOutDate") as string,
      confirmationId: formData.get("confirmationId") as string,
    } : undefined;

    let ticketFileBase64 = "";
    const fileInput = formData.get("ticketFile") as File;
    if (fileInput && fileInput.size > 0) {
      ticketFileBase64 = (await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileInput);
      })) as string;
    }

    const carrier = formData.get("carrier") as string;
    const transport = carrier ? {
      carrier,
      departureTime: formData.get("departureTime") as string,
      arrivalTime: formData.get("arrivalTime") as string,
      seatNumber: formData.get("seatNumber") as string,
      ticketFile: ticketFileBase64 || undefined,
    } : undefined;

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      itinerary: [],
      accommodation,
      transport,
    };

    const updatedTrips = [...trips, newTrip];
    try {
      localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
      onClose();
    } catch (err) {
      alert("Failed to save. If you uploaded a ticket, the file might be too large (max 5MB).");
    }
  };

  const onEditSubmit = async (e: React.FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    if (!editingTrip) return;
    const formData = new FormData(e.currentTarget);
    
    const hotelName = formData.get("hotelName") as string;
    const accommodation = hotelName ? {
      hotelName,
      address: formData.get("hotelAddress") as string,
      checkInDate: formData.get("checkInDate") as string,
      checkOutDate: formData.get("checkOutDate") as string,
      confirmationId: formData.get("confirmationId") as string,
    } : undefined;

    let ticketFileBase64 = editingTrip.transport?.ticketFile || "";
    const fileInput = formData.get("ticketFile") as File;
    if (fileInput && fileInput.size > 0) {
      ticketFileBase64 = (await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileInput);
      })) as string;
    }

    const carrier = formData.get("carrier") as string;
    const transport = carrier ? {
      carrier,
      departureTime: formData.get("departureTime") as string,
      arrivalTime: formData.get("arrivalTime") as string,
      seatNumber: formData.get("seatNumber") as string,
      ticketFile: ticketFileBase64 || undefined,
    } : undefined;

    const updatedTrip: Trip = {
      ...editingTrip,
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      accommodation,
      transport,
    };

    const updatedTrips = trips.map(t => t.id === editingTrip.id ? updatedTrip : t);
    try {
      localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
      onClose();
    } catch (err) {
      alert("Failed to save. If you uploaded a ticket, the file might be too large (max 5MB).");
    }
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

                      {trip.transport && (
                        <div className="flex flex-col gap-2 p-3 bg-primary-50 rounded-2xl border border-primary/20 mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IoAirplaneOutline className="text-primary" size={18} />
                              <span className="text-sm font-bold text-primary">{trip.transport.carrier}</span>
                            </div>
                            {trip.transport.seatNumber && (
                              <span className="text-xs text-primary-700 font-bold bg-primary/20 px-2 py-1 rounded-md">Seat: {trip.transport.seatNumber}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-default-600">
                            {trip.transport.departureTime && <span><strong className="text-default-800">Dep:</strong> {new Date(trip.transport.departureTime).toLocaleString()}</span>}
                            {trip.transport.arrivalTime && <span><strong className="text-default-800">Arr:</strong> {new Date(trip.transport.arrivalTime).toLocaleString()}</span>}
                          </div>
                          {trip.transport.ticketFile && (
                            <Button
                              as="a"
                              href={trip.transport.ticketFile}
                              download={`Ticket-${trip.transport.carrier}`}
                              target="_blank"
                              size="sm"
                              variant="flat"
                              color="primary"
                              className="text-xs font-bold mt-1 w-fit"
                              startContent={<IoTicketOutline />}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Ticket
                            </Button>
                          )}
                        </div>
                      )}

                      {trip.accommodation && (
                        <div className="flex flex-col gap-2 p-3 bg-default-50 rounded-2xl border border-divider mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IoBedOutline className="text-secondary" />
                              <span className="text-sm font-bold text-primary">{trip.accommodation.hotelName}</span>
                            </div>
                            {trip.accommodation.confirmationId && (
                              <span className="text-xs text-default-500 font-medium">ID: {trip.accommodation.confirmationId}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-default-500">
                            <IoCalendarOutline />
                            <span>{trip.accommodation.checkInDate} - {trip.accommodation.checkOutDate}</span>
                          </div>
                          {trip.accommodation.address && (
                            <Button
                              as="a"
                              href={`https://maps.google.com/?q=${encodeURIComponent(trip.accommodation.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              size="sm"
                              variant="light"
                              color="secondary"
                              className="text-xs font-bold w-fit px-0 min-w-0 h-6"
                              startContent={<IoMapOutline />}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View on Map
                            </Button>
                          )}
                        </div>
                      )}

                      {trip.checklist && trip.checklist.length > 0 && (
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex justify-between text-xs text-default-500 font-bold px-1">
                            <span>Checklist Progress</span>
                            <span>{trip.checklist.filter(c => c.isDone).length}/{trip.checklist.length}</span>
                          </div>
                          <Progress 
                            size="sm" 
                            color="success" 
                            value={(trip.checklist.filter(c => c.isDone).length / trip.checklist.length) * 100} 
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-divider">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-default-400 font-black">Itinerary</span>
                          <span className="text-sm font-bold text-primary">
                            {trip.itinerary?.length || 0} stops added
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            isIconOnly 
                            variant="flat" 
                            color="secondary" 
                            radius="full"
                            onClick={(e) => { e.stopPropagation(); handleOpenChecklist(trip.id); }}
                          >
                            <IoListOutline size={18} />
                          </Button>
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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur" scrollBehavior="inside">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                Create a New Trip
              </ModalHeader>
              <ModalBody className="w-full py-4">
                <Form id="add-trip-form" validationBehavior="native" onSubmit={(e) => onSubmit(e, onClose)} className="flex flex-col gap-6 w-full">
                <Input 
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
                  <Input isRequired name="startDate" label="Start Date" type="date" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input isRequired name="endDate" label="End Date" type="date" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>

                <Divider />
                <h4 className="font-bold text-lg italic border-b border-divider pb-2">Accommodation (Optional)</h4>
                <Input name="hotelName" label="Hotel Name" placeholder="e.g. The Ritz" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <Input name="hotelAddress" label="Address" placeholder="e.g. 15 Place Vendôme, Paris" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="checkInDate" label="Check-in Date" type="date" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input name="checkOutDate" label="Check-out Date" type="date" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
                <Input name="confirmationId" label="Confirmation ID" placeholder="e.g. X123456789" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                
                <Divider />
                <h4 className="font-bold text-lg italic border-b border-divider pb-2">Transport Details (Optional)</h4>
                <Input name="carrier" label="Carrier (Airline/Train)" placeholder="e.g. Delta Airlines" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="departureTime" label="Departure Time" type="datetime-local" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input name="arrivalTime" label="Arrival Time" type="datetime-local" placeholder=" " variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="seatNumber" label="Seat Number" placeholder="e.g. 12A" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input name="ticketFile" label="Boarding Pass" type="file" accept="image/*,.pdf" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
                </Form>
              </ModalBody>
              <ModalFooter className="w-full flex gap-3 pt-6">
                <Button color="danger" variant="light" className="font-bold" onPress={onClose}>Cancel</Button>
                <Button color="primary" type="submit" form="add-trip-form" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20">Create Trip</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} placement="center" backdrop="blur" scrollBehavior="inside">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                Edit Trip Details
              </ModalHeader>
              <ModalBody className="w-full py-4">
                <Form id="edit-trip-form" validationBehavior="native" onSubmit={(e) => onEditSubmit(e, onClose)} className="flex flex-col gap-6 w-full">
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
                  <Input isRequired name="startDate" label="Start Date" type="date" placeholder=" " defaultValue={editingTrip?.startDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input isRequired name="endDate" label="End Date" type="date" placeholder=" " defaultValue={editingTrip?.endDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>

                <Divider />
                <h4 className="font-bold text-lg italic border-b border-divider pb-2">Accommodation (Optional)</h4>
                <Input name="hotelName" label="Hotel Name" placeholder="e.g. The Ritz" defaultValue={editingTrip?.accommodation?.hotelName} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <Input name="hotelAddress" label="Address" placeholder="e.g. 15 Place Vendôme, Paris" defaultValue={editingTrip?.accommodation?.address} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="checkInDate" label="Check-in Date" type="date" placeholder=" " defaultValue={editingTrip?.accommodation?.checkInDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input name="checkOutDate" label="Check-out Date" type="date" placeholder=" " defaultValue={editingTrip?.accommodation?.checkOutDate} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
                <Input name="confirmationId" label="Confirmation ID" placeholder="e.g. X123456789" defaultValue={editingTrip?.accommodation?.confirmationId} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                
                <Divider />
                <h4 className="font-bold text-lg italic border-b border-divider pb-2">Transport Details (Optional)</h4>
                <Input name="carrier" label="Carrier (Airline/Train)" placeholder="e.g. Delta Airlines" defaultValue={editingTrip?.transport?.carrier} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="departureTime" label="Departure Time" type="datetime-local" placeholder=" " defaultValue={editingTrip?.transport?.departureTime} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <Input name="arrivalTime" label="Arrival Time" type="datetime-local" placeholder=" " defaultValue={editingTrip?.transport?.arrivalTime} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="seatNumber" label="Seat Number" placeholder="e.g. 12A" defaultValue={editingTrip?.transport?.seatNumber} variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                  <div className="flex flex-col w-full gap-1">
                    <Input name="ticketFile" label="Boarding Pass (Update)" type="file" accept="image/*,.pdf" variant="bordered" classNames={{ inputWrapper: "rounded-2xl" }} />
                    {editingTrip?.transport?.ticketFile && <span className="text-xs text-success px-2 font-medium">Ticket currently saved</span>}
                  </div>
                </div>
                </Form>
              </ModalBody>
              <ModalFooter className="w-full flex justify-between pt-6">
                <Button color="danger" variant="flat" isIconOnly className="rounded-xl" onPress={() => onDeleteTrip(editingTrip!.id, onClose)}>
                  <IoTrashOutline size={22} />
                </Button>
                <div className="flex gap-3">
                  <Button color="default" variant="light" className="font-bold" onPress={onClose}>Cancel</Button>
                  <Button color="primary" type="submit" form="edit-trip-form" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20">Save Changes</Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Checklist Modal */}
      <Modal isOpen={isChecklistOpen} onOpenChange={onChecklistOpenChange} placement="center" backdrop="blur" scrollBehavior="inside">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => {
            const currentTrip = trips.find(t => t.id === checklistTripId);
            const checklist = currentTrip?.checklist || [];
            const completed = checklist.filter(c => c.isDone).length;
            const total = checklist.length;
            const progress = total === 0 ? 0 : (completed / total) * 100;

            return (
              <>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                  Pre-trip Checklist
                </ModalHeader>
                <ModalBody className="w-full py-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-bold text-default-600 px-1">
                      <span>Progress</span>
                      <span>{completed} / {total}</span>
                    </div>
                    <Progress color="success" value={progress} className="w-full" size="sm" />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {checklist.length === 0 ? (
                      <p className="text-sm text-default-400 text-center py-4">No items added yet. Choose a preset or add your own.</p>
                    ) : (
                      checklist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-default-100 transition-colors">
                          <Checkbox 
                            isSelected={item.isDone} 
                            onValueChange={(isSelected) => handleToggleChecklistItem(currentTrip!.id, item.id, isSelected)}
                            color="success"
                            lineThrough
                          >
                            <span className={item.isDone ? "text-default-400" : "text-default-700"}>{item.text}</span>
                          </Checkbox>
                          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDeleteChecklistItem(currentTrip!.id, item.id)}>
                            <IoTrashOutline />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <Divider />
                  
                  <div className="flex flex-col gap-3">
                    <h5 className="text-sm font-bold">Presets</h5>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CHECKLIST.map((preset) => (
                        <Chip
                          key={preset}
                          isPressable
                          variant="flat"
                          color="secondary"
                          onClick={() => handleAddChecklistItem(currentTrip!.id, preset)}
                        >
                          + {preset}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center mt-2">
                    <Input 
                      placeholder="Add custom item..." 
                      value={customChecklistItem}
                      onValueChange={setCustomChecklistItem}
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-xl" }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem(currentTrip!.id, customChecklistItem);
                        }
                      }}
                    />
                    <Button 
                      color="primary" 
                      isIconOnly 
                      className="rounded-xl"
                      onPress={() => handleAddChecklistItem(currentTrip!.id, customChecklistItem)}
                    >
                      <IoAdd size={20} />
                    </Button>
                  </div>
                </ModalBody>
                <ModalFooter className="w-full flex justify-end pt-6">
                  <Button color="primary" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20" onPress={onClose}>Done</Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}

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
  Textarea,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
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
  IoStar,
  IoStarOutline,
  IoCameraOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoHourglassOutline,
  IoMenuOutline,
  IoEllipsisVertical,
  IoCalendarClearOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";
import { getAllDestinations } from "@/utils/destinations";
import { MapComponent } from "@/components/mapComponent";

const destinations = getAllDestinations();

export const Route = createFileRoute("/_app/trips/")({
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

interface ItineraryActivity {
  id: string;
  title: string;
  startTime: string;
  duration: string;
  dayIndex: number;
  lat?: number;
  lng?: number;
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
  plannedActivities?: ItineraryActivity[];
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
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isChecklistOpen,
    onOpen: onChecklistOpen,
    onOpenChange: onChecklistOpenChange,
  } = useDisclosure();
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onOpenChange: onReviewOpenChange,
  } = useDisclosure();
  const {
    isOpen: isItineraryOpen,
    onOpen: onItineraryOpen,
    onOpenChange: onItineraryOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditActivityOpen,
    onOpen: onEditActivityOpen,
    onOpenChange: onEditActivityOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMapModalOpen,
    onOpen: onMapModalOpen,
    onOpenChange: onMapModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRouteMapOpen,
    onOpen: onRouteMapOpen,
    onOpenChange: onRouteMapOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPickerOpen,
    onOpen: onPickerOpen,
    onOpenChange: onPickerOpenChange,
  } = useDisclosure();

  const [pickerConfig, setPickerConfig] = useState<{
    target: "new" | "edit";
    initialLat?: number;
    initialLng?: number;
  } | null>(null);

  const [mapModalData, setMapModalData] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [routeMapData, setRouteMapData] = useState<{
    points: { lat: number; lng: number; name: string }[];
  } | null>(null);

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

  const [reviewTrip, setReviewTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  // Itinerary State
  const [itineraryTrip, setItineraryTrip] = useState<Trip | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("");
  const [newActivityDuration, setNewActivityDuration] = useState("");
  const [newActivityLat, setNewActivityLat] = useState("");
  const [newActivityLng, setNewActivityLng] = useState("");
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(
    null,
  );

  const [editingActivity, setEditingActivity] =
    useState<ItineraryActivity | null>(null);
  const [editActivityTitle, setEditActivityTitle] = useState("");
  const [editActivityTime, setEditActivityTime] = useState("");
  const [editActivityDuration, setEditActivityDuration] = useState("");
  const [editActivityLat, setEditActivityLat] = useState("");
  const [editActivityLng, setEditActivityLng] = useState("");

  const [reviews, setReviews] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("travel-planner-reviews");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleOpenChecklist = (tripId: string) => {
    setChecklistTripId(tripId);
    onChecklistOpen();
  };

  const handleToggleChecklistItem = (
    tripId: string,
    itemId: string,
    isDone: boolean,
  ) => {
    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        return {
          ...t,
          checklist: t.checklist?.map((c) =>
            c.id === itemId ? { ...c, isDone } : c,
          ),
        };
      }
      return t;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
  };

  const handleAddChecklistItem = (tripId: string, text: string) => {
    if (!text.trim()) return;
    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        const newChecklist = [
          ...(t.checklist || []),
          { id: Date.now().toString(), text, isDone: false },
        ];
        return { ...t, checklist: newChecklist };
      }
      return t;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setCustomChecklistItem("");
  };

  const handleDeleteChecklistItem = (tripId: string, itemId: string) => {
    const updatedTrips = trips.map((t) =>
      t.id === tripId
        ? { ...t, checklist: t.checklist?.filter((c) => c.id !== itemId) }
        : t,
    );
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
  };

  const handleOpenReview = (trip: Trip) => {
    const existingReview = reviews.find((r) => r.tripId === trip.id);
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.text);
      setReviewPhotos(existingReview.photos || []);
    } else {
      setRating(0);
      setHoverRating(0);
      setReviewText("");
      setReviewPhotos([]);
    }
    setReviewTrip(trip);
    onReviewOpen();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (reviewPhotos.length + files.length > 3) {
      alert("You can only upload up to 3 photos.");
      return;
    }

    const newPhotos = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }),
    );

    setReviewPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
  };

  const removePhoto = (index: number) => {
    setReviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitReview = (onClose: () => void) => {
    if (!reviewTrip || rating === 0) {
      alert("Please select a rating (1-5 stars).");
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      tripId: reviewTrip.id,
      destinationId: reviewTrip.destinationId,
      userId: "current_user",
      userName: "Traveler",
      rating,
      text: reviewText,
      photos: reviewPhotos,
      timestamp: new Date().toISOString(),
    };

    const updatedReviews = reviews.filter((r) => r.tripId !== reviewTrip.id);
    updatedReviews.push(newReview);

    setReviews(updatedReviews);
    localStorage.setItem(
      "travel-planner-reviews",
      JSON.stringify(updatedReviews),
    );
    onClose();
  };

  // ITINERARY LOGIC

  const getTripDays = (trip: Trip) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 100) diffDays = 100;
    return Array.from({ length: diffDays }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        index: i,
        label: `Day ${i + 1}`,
        dateString: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        date,
      };
    });
  };

  const handleOpenItinerary = (trip: Trip) => {
    setItineraryTrip(trip);
    setSelectedDay(0);
    onItineraryOpen();
  };

  const handleAddActivity = () => {
    if (!itineraryTrip || !newActivityTitle || !newActivityTime) return;

    const newActivity: ItineraryActivity = {
      id: Date.now().toString(),
      title: newActivityTitle,
      startTime: newActivityTime,
      duration: newActivityDuration,
      dayIndex: selectedDay,
      lat: newActivityLat ? parseFloat(newActivityLat) : undefined,
      lng: newActivityLng ? parseFloat(newActivityLng) : undefined,
    };

    const updatedTrips = trips.map((t) => {
      if (t.id === itineraryTrip.id) {
        const newActs = [...(t.plannedActivities || []), newActivity];
        return { ...t, plannedActivities: newActs };
      }
      return t;
    });

    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setItineraryTrip(
      updatedTrips.find((t) => t.id === itineraryTrip.id) || null,
    );
    setNewActivityTitle("");
    setNewActivityTime("");
    setNewActivityDuration("");
    setNewActivityLat("");
    setNewActivityLng("");
  };

  const handleMockLocation = (isEdit: boolean) => {
    if (!itineraryTrip) return;
    const dest = destinations.find(
      (d) => String(d.id) === itineraryTrip.destinationId,
    );
    if (dest) {
      const randomLat = dest.coordinates.lat + (Math.random() - 0.5) * 0.05;
      const randomLng = dest.coordinates.lng + (Math.random() - 0.5) * 0.05;
      if (isEdit) {
        setEditActivityLat(randomLat.toFixed(6));
        setEditActivityLng(randomLng.toFixed(6));
      } else {
        setNewActivityLat(randomLat.toFixed(6));
        setNewActivityLng(randomLng.toFixed(6));
      }
    }
  };

  const handleOpenPicker = (isEdit: boolean) => {
    if (!itineraryTrip) return;
    const dest = destinations.find(
      (d) => String(d.id) === itineraryTrip.destinationId,
    );
    setPickerConfig({
      target: isEdit ? "edit" : "new",
      initialLat: isEdit ? parseFloat(editActivityLat) || dest?.coordinates.lat : parseFloat(newActivityLat) || dest?.coordinates.lat,
      initialLng: isEdit ? parseFloat(editActivityLng) || dest?.coordinates.lng : parseFloat(newActivityLng) || dest?.coordinates.lng,
    });
    onPickerOpen();
  };

  const handleLocationPicked = (lat: number, lng: number) => {
    if (!pickerConfig) return;
    if (pickerConfig.target === "edit") {
      setEditActivityLat(lat.toFixed(6));
      setEditActivityLng(lng.toFixed(6));
    } else {
      setNewActivityLat(lat.toFixed(6));
      setNewActivityLng(lng.toFixed(6));
    }
  };

  const handleDeleteActivity = (tripId: string, actId: string) => {
    const updatedTrips = trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            plannedActivities: t.plannedActivities?.filter(
              (a) => a.id !== actId,
            ),
          }
        : t,
    );
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setItineraryTrip(updatedTrips.find((t) => t.id === tripId) || null);
  };

  const handleMoveActivity = (
    tripId: string,
    actId: string,
    newDayIndex: number,
  ) => {
    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) {
        const newActs = (t.plannedActivities || [])
          .map((a) => (a.id === actId ? { ...a, dayIndex: newDayIndex } : a))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return { ...t, plannedActivities: newActs };
      }
      return t;
    });
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setItineraryTrip(updatedTrips.find((t) => t.id === tripId) || null);
  };

  const handleInitiateEditActivity = (act: ItineraryActivity) => {
    setEditingActivity(act);
    setEditActivityTitle(act.title);
    setEditActivityTime(act.startTime);
    setEditActivityDuration(act.duration || "");
    setEditActivityLat(act.lat ? act.lat.toString() : "");
    setEditActivityLng(act.lng ? act.lng.toString() : "");
    onEditActivityOpen();
  };

  const handleSaveEditActivity = (onClose: () => void) => {
    if (
      !itineraryTrip ||
      !editingActivity ||
      !editActivityTitle ||
      !editActivityTime
    )
      return;

    const updatedTrips = trips.map((t) => {
      if (t.id === itineraryTrip.id) {
        const newActs = (t.plannedActivities || []).map((a) => {
          if (a.id === editingActivity.id) {
            return {
              ...a,
              title: editActivityTitle,
              startTime: editActivityTime,
              duration: editActivityDuration,
              lat: editActivityLat ? parseFloat(editActivityLat) : undefined,
              lng: editActivityLng ? parseFloat(editActivityLng) : undefined,
            };
          }
          return a;
        });
        return { ...t, plannedActivities: newActs };
      }
      return t;
    });

    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setItineraryTrip(
      updatedTrips.find((t) => t.id === itineraryTrip.id) || null,
    );
    onClose();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedActivityId || draggedActivityId === targetId || !itineraryTrip)
      return;
    const currentActs = [...(itineraryTrip.plannedActivities || [])];
    const draggedIndex = currentActs.findIndex(
      (a) => a.id === draggedActivityId,
    );
    const targetIndex = currentActs.findIndex((a) => a.id === targetId);
    if (draggedIndex > -1 && targetIndex > -1) {
      const [draggedAct] = currentActs.splice(draggedIndex, 1);
      currentActs.splice(targetIndex, 0, draggedAct);
      const updatedTrips = trips.map((t) =>
        t.id === itineraryTrip.id
          ? { ...t, plannedActivities: currentActs }
          : t,
      );
      setTrips(updatedTrips);
      localStorage.setItem(
        "travel-planner-trips",
        JSON.stringify(updatedTrips),
      );
      setItineraryTrip(
        updatedTrips.find((t) => t.id === itineraryTrip.id) || null,
      );
    }
    setDraggedActivityId(null);
  };

  const handleSortActivitiesByTime = () => {
    if (!itineraryTrip) return;
    const sortedActs = [...(itineraryTrip.plannedActivities || [])].sort(
      (a, b) => a.startTime.localeCompare(b.startTime),
    );
    const updatedTrips = trips.map((t) =>
      t.id === itineraryTrip.id ? { ...t, plannedActivities: sortedActs } : t,
    );
    setTrips(updatedTrips);
    localStorage.setItem("travel-planner-trips", JSON.stringify(updatedTrips));
    setItineraryTrip(
      updatedTrips.find((t) => t.id === itineraryTrip.id) || null,
    );
  };

  // Request notification permissions
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Check for upcoming departures (3 hours before)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let updated = false;
      const notifiedTrips = JSON.parse(
        localStorage.getItem("notified-trips") || "{}",
      );

      trips.forEach((trip) => {
        if (trip.transport?.departureTime) {
          const depTime = new Date(trip.transport.departureTime).getTime();
          const threeHours = 3 * 60 * 60 * 1000;

          if (
            depTime - now <= threeHours &&
            depTime > now &&
            !notifiedTrips[trip.id]
          ) {
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(`Upcoming Trip: ${trip.name}`, {
                body: `${trip.transport.carrier} departs in less than 3 hours (Seat: ${trip.transport.seatNumber || "N/A"}).`,
              });
            } else {
              alert(
                `Reminder: Your trip "${trip.name}" via ${trip.transport.carrier} departs in less than 3 hours!`,
              );
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

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onClose: () => void,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const hotelName = formData.get("hotelName") as string;
    const accommodation = hotelName
      ? {
          hotelName,
          address: formData.get("hotelAddress") as string,
          checkInDate: formData.get("checkInDate") as string,
          checkOutDate: formData.get("checkOutDate") as string,
          confirmationId: formData.get("confirmationId") as string,
        }
      : undefined;

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
    const transport = carrier
      ? {
          carrier,
          departureTime: formData.get("departureTime") as string,
          arrivalTime: formData.get("arrivalTime") as string,
          seatNumber: formData.get("seatNumber") as string,
          ticketFile: ticketFileBase64 || undefined,
        }
      : undefined;

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
      localStorage.setItem(
        "travel-planner-trips",
        JSON.stringify(updatedTrips),
      );
      setTrips(updatedTrips);
      onClose();
    } catch (err) {
      alert(
        "Failed to save. If you uploaded a ticket, the file might be too large (max 5MB).",
      );
    }
  };

  const onEditSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onClose: () => void,
  ) => {
    e.preventDefault();
    if (!editingTrip) return;
    const formData = new FormData(e.currentTarget);

    const hotelName = formData.get("hotelName") as string;
    const accommodation = hotelName
      ? {
          hotelName,
          address: formData.get("hotelAddress") as string,
          checkInDate: formData.get("checkInDate") as string,
          checkOutDate: formData.get("checkOutDate") as string,
          confirmationId: formData.get("confirmationId") as string,
        }
      : undefined;

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
    const transport = carrier
      ? {
          carrier,
          departureTime: formData.get("departureTime") as string,
          arrivalTime: formData.get("arrivalTime") as string,
          seatNumber: formData.get("seatNumber") as string,
          ticketFile: ticketFileBase64 || undefined,
        }
      : undefined;

    const updatedTrip: Trip = {
      ...editingTrip,
      name: formData.get("name") as string,
      destinationId: formData.get("destinationId") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      accommodation,
      transport,
    };

    const updatedTrips = trips.map((t) =>
      t.id === editingTrip.id ? updatedTrip : t,
    );
    try {
      localStorage.setItem(
        "travel-planner-trips",
        JSON.stringify(updatedTrips),
      );
      setTrips(updatedTrips);
      onClose();
    } catch (err) {
      alert(
        "Failed to save. If you uploaded a ticket, the file might be too large (max 5MB).",
      );
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
              const dest = destinations.find(
                (d) => String(d.id) === trip.destinationId,
              );
              const isTripFinished =
                new Date(trip.endDate).getTime() < new Date().getTime();
              const hasReviewed = reviews.some((r) => r.tripId === trip.id);
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
                          <IoAirplaneOutline
                            size={48}
                            className="text-default-300"
                          />
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
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold">
                              {trip.startDate} - {trip.endDate}
                            </span>
                            <span className="text-[10px] text-default-400 font-black uppercase tracking-wider">
                              {(() => {
                                const start = new Date(trip.startDate);
                                const end = new Date(trip.endDate);
                                const diffTime = Math.abs(
                                  end.getTime() - start.getTime(),
                                );
                                const diffDays =
                                  Math.ceil(diffTime / (1000 * 60 * 60 * 24)) +
                                  1;
                                return `${diffDays} ${diffDays === 1 ? "Day" : "Days"}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {trip.transport && (
                        <div className="flex flex-col gap-2 p-3 bg-primary-50 rounded-2xl border border-primary/20 mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IoAirplaneOutline
                                className="text-primary"
                                size={18}
                              />
                              <span className="text-sm font-bold text-primary">
                                {trip.transport.carrier}
                              </span>
                            </div>
                            {trip.transport.seatNumber && (
                              <span className="text-xs text-primary-700 font-bold bg-primary/20 px-2 py-1 rounded-md">
                                Seat: {trip.transport.seatNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-default-600">
                            {trip.transport.departureTime && (
                              <span>
                                <strong className="text-default-800">
                                  Dep:
                                </strong>{" "}
                                {new Date(
                                  trip.transport.departureTime,
                                ).toLocaleString()}
                              </span>
                            )}
                            {trip.transport.arrivalTime && (
                              <span>
                                <strong className="text-default-800">
                                  Arr:
                                </strong>{" "}
                                {new Date(
                                  trip.transport.arrivalTime,
                                ).toLocaleString()}
                              </span>
                            )}
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
                              <span className="text-sm font-bold text-primary">
                                {trip.accommodation.hotelName}
                              </span>
                            </div>
                            {trip.accommodation.confirmationId && (
                              <span className="text-xs text-default-500 font-medium">
                                ID: {trip.accommodation.confirmationId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-default-500">
                            <IoCalendarOutline />
                            <span>
                              {trip.accommodation.checkInDate} -{" "}
                              {trip.accommodation.checkOutDate}
                            </span>
                          </div>
                          {trip.accommodation.address && (
                            <Button
                              size="sm"
                              variant="light"
                              color="secondary"
                              className="text-xs font-bold w-fit px-0 min-w-0 h-6"
                              startContent={<IoMapOutline />}
                              onClick={(e) => {
                                e.stopPropagation();
                                const dest = destinations.find(
                                  (d) => String(d.id) === trip.destinationId,
                                );
                                if (dest) {
                                  setMapModalData({
                                    lat: dest.coordinates.lat,
                                    lng: dest.coordinates.lng,
                                    name: trip.accommodation.hotelName,
                                  });
                                  onMapModalOpen();
                                }
                              }}
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
                            <span>
                              {trip.checklist.filter((c) => c.isDone).length}/
                              {trip.checklist.length}
                            </span>
                          </div>
                          <Progress
                            size="sm"
                            color="success"
                            value={
                              (trip.checklist.filter((c) => c.isDone).length /
                                trip.checklist.length) *
                              100
                            }
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-divider">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-default-400 font-black">
                            Itinerary
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {trip.plannedActivities?.length ||
                              trip.itinerary?.length ||
                              0}{" "}
                            stops added
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            variant="flat"
                            color="secondary"
                            radius="full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChecklist(trip.id);
                            }}
                          >
                            <IoListOutline size={18} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="flat"
                            color="primary"
                            radius="full"
                            className="group-hover:translate-x-1 transition-transform"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenItinerary(trip);
                            }}
                          >
                            <IoChevronForwardOutline size={20} />
                          </Button>
                        </div>
                      </div>

                      {/* Add Review Button for finished trips */}
                      {isTripFinished && (
                        <div className="mt-2">
                          <Button
                            color={hasReviewed ? "success" : "primary"}
                            variant={hasReviewed ? "flat" : "shadow"}
                            className="w-full font-bold rounded-xl"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenReview(trip);
                            }}
                            startContent={
                              hasReviewed ? <IoStar /> : <IoStarOutline />
                            }
                          >
                            {hasReviewed ? "Edit Review" : "Leave a Review"}
                          </Button>
                        </div>
                      )}
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
              Start creating your dream itinerary and keep all your travel plans
              in one place.
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                Create a New Trip
              </ModalHeader>
              <ModalBody className="w-full py-4">
                <Form
                  id="add-trip-form"
                  validationBehavior="native"
                  onSubmit={(e) => onSubmit(e, onClose)}
                  className="flex flex-col gap-6 w-full"
                >
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
                    <Input
                      isRequired
                      name="startDate"
                      label="Start Date"
                      type="date"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                    <Input
                      isRequired
                      name="endDate"
                      label="End Date"
                      type="date"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                  </div>

                  <Divider />
                  <h4 className="font-bold text-lg italic border-b border-divider pb-2">
                    Accommodation (Optional)
                  </h4>
                  <Input
                    name="hotelName"
                    label="Hotel Name"
                    placeholder="e.g. The Ritz"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-2xl" }}
                  />
                  <Input
                    name="hotelAddress"
                    label="Address"
                    placeholder="e.g. 15 Place Vendôme, Paris"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-2xl" }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="checkInDate"
                      label="Check-in Date"
                      type="date"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                    <Input
                      name="checkOutDate"
                      label="Check-out Date"
                      type="date"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                  </div>
                  <Input
                    name="confirmationId"
                    label="Confirmation ID"
                    placeholder="e.g. X123456789"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-2xl" }}
                  />

                  <Divider />
                  <h4 className="font-bold text-lg italic border-b border-divider pb-2">
                    Transport Details (Optional)
                  </h4>
                  <Input
                    name="carrier"
                    label="Carrier (Airline/Train)"
                    placeholder="e.g. Delta Airlines"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-2xl" }}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      name="departureTime"
                      label="Departure Time"
                      type="datetime-local"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                    <Input
                      name="arrivalTime"
                      label="Arrival Time"
                      type="datetime-local"
                      placeholder=" "
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="seatNumber"
                      label="Seat Number"
                      placeholder="e.g. 12A"
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                    <Input
                      name="ticketFile"
                      label="Boarding Pass"
                      type="file"
                      accept="image/*,.pdf"
                      variant="bordered"
                      classNames={{ inputWrapper: "rounded-2xl" }}
                    />
                  </div>
                </Form>
              </ModalBody>
              <ModalFooter className="w-full flex gap-3 pt-6">
                <Button
                  color="danger"
                  variant="light"
                  className="font-bold"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  form="add-trip-form"
                  className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                >
                  Create Trip
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        size="4xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "bg-background shadow-2xl rounded-[3rem] overflow-hidden border-none max-h-[90vh]",
          header: "border-b-2 border-divider/50 px-8 py-6 z-40 bg-background/80 backdrop-blur-md sticky top-0",
          footer: "border-t-2 border-divider/50 px-8 py-6 bg-background/80 backdrop-blur-md",
          closeButton: "hover:bg-default-200 z-50 top-6 right-6 p-2 rounded-full bg-background/50 backdrop-blur-md",
        }}
      >
        <ModalContent>
          {(onClose) => {
            const destForEdit = destinations.find(d => String(d.id) === editingTrip?.destinationId);
            return (
            <>
              <ModalHeader className="flex flex-col gap-1 pr-16">
                <h2 className="text-3xl font-extrabold italic">
                  Edit Trip: {editingTrip?.name}
                </h2>
              </ModalHeader>
              <ModalBody className="p-0">
                <ScrollShadow className="w-full" hideScrollBar>
                  {destForEdit && (
                    <div className="relative w-full h-[300px]">
                      <img
                        src={destForEdit.mainImageUrl}
                        alt={destForEdit.name}
                        className="w-full h-full object-cover rounded-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                  )}
                  
                  <div className={`px-8 pb-12 flex flex-col gap-8 ${destForEdit ? '-mt-12 relative z-10' : 'pt-8'}`}>
                    <Form
                      id="edit-trip-form"
                      validationBehavior="native"
                      onSubmit={(e) => onEditSubmit(e, onClose)}
                      className="flex flex-col gap-8 w-full"
                    >
                      <Card className="border-none shadow-xl rounded-[2rem] p-4 w-full">
                        <CardBody className="flex flex-col gap-6">
                          <h4 className="text-xl font-bold italic flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            General Info
                          </h4>
                          <Input
                            isRequired
                            name="name"
                            label="Trip Name"
                            defaultValue={editingTrip?.name}
                            variant="bordered"
                            classNames={{ inputWrapper: "rounded-2xl" }}
                          />

                          {editingTrip && (
                            <Select
                              isRequired
                              name="destinationId"
                              label="Destination"
                              defaultSelectedKeys={[editingTrip.destinationId]}
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
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              isRequired
                              name="startDate"
                              label="Start Date"
                              type="date"
                              placeholder=" "
                              defaultValue={editingTrip?.startDate}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                            <Input
                              isRequired
                              name="endDate"
                              label="End Date"
                              type="date"
                              placeholder=" "
                              defaultValue={editingTrip?.endDate}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                          </div>
                        </CardBody>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-xl rounded-[2rem] p-4">
                          <CardBody className="flex flex-col gap-6">
                            <h4 className="text-xl font-bold italic flex items-center gap-2">
                              <div className="w-1.5 h-6 bg-secondary rounded-full" />
                              Accommodation (Optional)
                            </h4>
                            <Input
                              name="hotelName"
                              label="Hotel Name"
                              placeholder="e.g. The Ritz"
                              defaultValue={editingTrip?.accommodation?.hotelName}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                            <Input
                              name="hotelAddress"
                              label="Address"
                              placeholder="e.g. 15 Place Vendôme, Paris"
                              defaultValue={editingTrip?.accommodation?.address}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                name="checkInDate"
                                label="Check-in"
                                type="date"
                                placeholder=" "
                                defaultValue={editingTrip?.accommodation?.checkInDate}
                                variant="bordered"
                                classNames={{ inputWrapper: "rounded-2xl" }}
                              />
                              <Input
                                name="checkOutDate"
                                label="Check-out"
                                type="date"
                                placeholder=" "
                                defaultValue={editingTrip?.accommodation?.checkOutDate}
                                variant="bordered"
                                classNames={{ inputWrapper: "rounded-2xl" }}
                              />
                            </div>
                            <Input
                              name="confirmationId"
                              label="Confirmation ID"
                              placeholder="e.g. X123456789"
                              defaultValue={editingTrip?.accommodation?.confirmationId}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                          </CardBody>
                        </Card>

                        <Card className="border-none shadow-xl rounded-[2rem] p-4">
                          <CardBody className="flex flex-col gap-6">
                            <h4 className="text-xl font-bold italic flex items-center gap-2">
                              <div className="w-1.5 h-6 bg-warning rounded-full" />
                              Transport Details (Optional)
                            </h4>
                            <Input
                              name="carrier"
                              label="Carrier (Airline/Train)"
                              placeholder="e.g. Delta Airlines"
                              defaultValue={editingTrip?.transport?.carrier}
                              variant="bordered"
                              classNames={{ inputWrapper: "rounded-2xl" }}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                name="departureTime"
                                label="Departure Time"
                                type="datetime-local"
                                placeholder=" "
                                defaultValue={editingTrip?.transport?.departureTime}
                                variant="bordered"
                                classNames={{ inputWrapper: "rounded-2xl" }}
                              />
                              <Input
                                name="arrivalTime"
                                label="Arrival Time"
                                type="datetime-local"
                                placeholder=" "
                                defaultValue={editingTrip?.transport?.arrivalTime}
                                variant="bordered"
                                classNames={{ inputWrapper: "rounded-2xl" }}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <Input
                                name="seatNumber"
                                label="Seat Number"
                                placeholder="e.g. 12A"
                                defaultValue={editingTrip?.transport?.seatNumber}
                                variant="bordered"
                                classNames={{ inputWrapper: "rounded-2xl" }}
                              />
                              <div className="flex flex-col w-full gap-1">
                                <Input
                                  name="ticketFile"
                                  label="Boarding Pass (Update)"
                                  type="file"
                                  accept="image/*,.pdf"
                                  variant="bordered"
                                  classNames={{ inputWrapper: "rounded-2xl" }}
                                />
                                {editingTrip?.transport?.ticketFile && (
                                  <span className="text-xs text-success px-2 font-medium">
                                    Ticket currently saved
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </Form>
                  </div>
                </ScrollShadow>
              </ModalBody>
              <ModalFooter className="w-full flex justify-between">
                <Button
                  color="danger"
                  variant="flat"
                  className="font-bold rounded-xl px-6"
                  onPress={() => onDeleteTrip(editingTrip!.id, onClose)}
                  startContent={<IoTrashOutline size={18} />}
                >
                  Delete Trip
                </Button>
                <div className="flex gap-3">
                  <Button
                    color="default"
                    variant="light"
                    className="font-bold"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    form="edit-trip-form"
                    className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                  >
                    Save Changes
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}}
        </ModalContent>
      </Modal>

      {/* Checklist Modal */}
      <Modal
        isOpen={isChecklistOpen}
        onOpenChange={onChecklistOpenChange}
        placement="center"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => {
            const currentTrip = trips.find((t) => t.id === checklistTripId);
            const checklist = currentTrip?.checklist || [];
            const completed = checklist.filter((c) => c.isDone).length;
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
                      <span>
                        {completed} / {total}
                      </span>
                    </div>
                    <Progress
                      color="success"
                      value={progress}
                      className="w-full"
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {checklist.length === 0 ? (
                      <p className="text-sm text-default-400 text-center py-4">
                        No items added yet. Choose a preset or add your own.
                      </p>
                    ) : (
                      checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-default-100 transition-colors"
                        >
                          <Checkbox
                            isSelected={item.isDone}
                            onValueChange={(isSelected) =>
                              handleToggleChecklistItem(
                                currentTrip!.id,
                                item.id,
                                isSelected,
                              )
                            }
                            color="success"
                            lineThrough
                          >
                            <span
                              className={
                                item.isDone
                                  ? "text-default-400"
                                  : "text-default-700"
                              }
                            >
                              {item.text}
                            </span>
                          </Checkbox>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() =>
                              handleDeleteChecklistItem(
                                currentTrip!.id,
                                item.id,
                              )
                            }
                          >
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
                          onClick={() =>
                            handleAddChecklistItem(currentTrip!.id, preset)
                          }
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
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddChecklistItem(
                            currentTrip!.id,
                            customChecklistItem,
                          );
                        }
                      }}
                    />
                    <Button
                      color="primary"
                      isIconOnly
                      className="rounded-xl"
                      onPress={() =>
                        handleAddChecklistItem(
                          currentTrip!.id,
                          customChecklistItem,
                        )
                      }
                    >
                      <IoAdd size={20} />
                    </Button>
                  </div>
                </ModalBody>
                <ModalFooter className="w-full flex justify-end pt-6">
                  <Button
                    color="primary"
                    className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                    onPress={onClose}
                  >
                    Done
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onOpenChange={onReviewOpenChange}
        placement="center"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => {
            const dest = destinations.find(
              (d) => String(d.id) === reviewTrip?.destinationId,
            );
            return (
              <>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-bold italic">
                  How was {dest?.name || "your trip"}?
                </ModalHeader>
                <ModalBody className="w-full py-4 flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-default-500 font-medium">
                      Tap to rate your experience
                    </span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-4xl text-warning transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          {(hoverRating || rating) >= star ? (
                            <IoStar />
                          ) : (
                            <IoStarOutline />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Tell us about your experience..."
                    placeholder="What did you love? What could be better?"
                    variant="bordered"
                    value={reviewText}
                    onValueChange={setReviewText}
                    classNames={{ inputWrapper: "rounded-2xl" }}
                    minRows={4}
                  />

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-default-700">
                      Add Photos (Max 3)
                    </span>
                    <div className="flex gap-4 items-center">
                      {reviewPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md"
                        >
                          <img
                            src={photo}
                            alt={`Review ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 text-danger bg-white/80 rounded-full"
                            onClick={() => removePhoto(index)}
                          >
                            <IoCloseCircleOutline size={20} />
                          </button>
                        </div>
                      ))}
                      {reviewPhotos.length < 3 && (
                        <label className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-divider hover:border-primary hover:text-primary cursor-pointer transition-colors text-default-400 bg-default-50">
                          <IoCameraOutline size={24} />
                          <span className="text-[10px] font-bold mt-1">
                            Upload
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="w-full flex gap-3 pt-6">
                  <Button
                    color="danger"
                    variant="light"
                    className="font-bold"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                    onPress={() => onSubmitReview(onClose)}
                  >
                    Post Review
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* Itinerary Planner Modal */}
      <Modal
        isOpen={isItineraryOpen}
        onOpenChange={onItineraryOpenChange}
        size="3xl"
        placement="center"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          closeButton: "z-50 top-6 right-6 p-2 rounded-full bg-default-100 hover:bg-default-200",
        }}
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => {
            const tripDays = itineraryTrip ? getTripDays(itineraryTrip) : [];
            const dayActivities = (
              itineraryTrip?.plannedActivities || []
            ).filter((a) => a.dayIndex === selectedDay);

            const currentDayDate = tripDays[selectedDay]?.date;
            const isHotelDay =
              itineraryTrip?.accommodation &&
              currentDayDate &&
              new Date(currentDayDate).setHours(0, 0, 0, 0) >=
                new Date(itineraryTrip.accommodation.checkInDate).setHours(
                  0,
                  0,
                  0,
                  0,
                ) &&
              new Date(currentDayDate).setHours(0, 0, 0, 0) <=
                new Date(itineraryTrip.accommodation.checkOutDate).setHours(
                  0,
                  0,
                  0,
                  0,
                );

            return (
              <>
                <ModalHeader className="flex flex-col gap-1 px-6 pt-6 relative pr-16">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold italic flex items-center gap-2">
                        {itineraryTrip?.name}
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          className="font-bold italic text-xs"
                        >
                          {tripDays.length}{" "}
                          {tripDays.length === 1 ? "Day" : "Days"}
                        </Chip>
                      </h2>
                      <p className="text-sm text-default-500 font-medium">
                        Plan your daily activities and organize your time.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        className="font-bold rounded-xl"
                        startContent={<IoTimeOutline />}
                        onPress={handleSortActivitiesByTime}
                      >
                        Sort by Time
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="font-bold rounded-xl"
                        startContent={<IoMapOutline />}
                        onPress={() => {
                          const points = dayActivities
                            .filter((a) => a.lat && a.lng)
                            .map((a) => ({
                              lat: a.lat!,
                              lng: a.lng!,
                              name: a.title,
                            }));
                          if (points.length > 0) {
                            setRouteMapData({ points });
                            onRouteMapOpen();
                          } else {
                            alert(
                              "Please add coordinates to at least one activity first! You can use the 'Mock' button when adding an activity.",
                            );
                          }
                        }}
                      >
                        View Route
                      </Button>
                    </div>
                  </div>
                </ModalHeader>

                <ModalBody className="px-6 py-2 flex flex-col gap-6">
                  <Tabs
                    aria-label="Trip Days"
                    variant="light"
                    color="primary"
                    selectedKey={selectedDay.toString()}
                    onSelectionChange={(k) => setSelectedDay(Number(k))}
                    classNames={{
                      tabList: "w-full gap-4 overflow-x-auto pb-2",
                      tab: "px-6 py-3 h-auto",
                      tabContent: "flex flex-col items-center gap-1",
                    }}
                  >
                    {tripDays.map((day) => {
                      const hasActivities = (
                        itineraryTrip?.plannedActivities || []
                      ).some((a) => a.dayIndex === day.index);
                      return (
                        <Tab
                          key={day.index.toString()}
                          title={
                            <div
                              className={`flex flex-col items-center gap-0.5 transition-all ${hasActivities ? "opacity-100 drop-shadow-sm" : "opacity-50"}`}
                            >
                              <div className="flex items-center gap-1.5 relative">
                                <span className="font-bold text-lg">
                                  {day.label}
                                </span>
                                {hasActivities && (
                                  <span className="absolute -right-3.5 top-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                                )}
                              </div>
                              <span className="text-xs">{day.dateString}</span>
                            </div>
                          }
                        />
                      );
                    })}
                  </Tabs>

                  <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    {isHotelDay && itineraryTrip?.accommodation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4"
                      >
                        <Card className="bg-secondary-50 border-2 border-secondary/20 shadow-md rounded-[2rem]">
                          <CardBody className="p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                  <IoBedOutline size={24} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-secondary-900 leading-tight">
                                    {itineraryTrip.accommodation.hotelName}
                                  </h4>
                                  <p className="text-xs text-secondary-600 font-bold uppercase tracking-wider">
                                    Stay at Hotel
                                  </p>
                                </div>
                              </div>
                              {itineraryTrip.accommodation.confirmationId && (
                                <Chip
                                  size="sm"
                                  color="secondary"
                                  variant="flat"
                                  className="font-bold px-2"
                                >
                                  ID:{" "}
                                  {itineraryTrip.accommodation.confirmationId}
                                </Chip>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-default-600 px-1">
                              <IoLocationOutline className="text-secondary" />
                              <span className="font-medium">
                                {itineraryTrip.accommodation.address}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-secondary/10">
                              <div className="flex items-center gap-2 text-xs font-bold text-secondary-700">
                                <IoCalendarOutline />
                                <span>
                                  Check-in:{" "}
                                  {itineraryTrip.accommodation.checkInDate} —
                                  Out:{" "}
                                  {itineraryTrip.accommodation.checkOutDate}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="solid"
                                color="secondary"
                                className="font-bold rounded-xl h-8 px-4"
                                startContent={<IoMapOutline size={16} />}
                                onClick={() => {
                                  const dest = destinations.find(
                                    (d) =>
                                      String(d.id) ===
                                      itineraryTrip.destinationId,
                                  );
                                  if (dest) {
                                    setMapModalData({
                                      lat: dest.coordinates.lat,
                                      lng: dest.coordinates.lng,
                                      name:
                                        itineraryTrip.accommodation
                                          ?.hotelName || "Hotel",
                                    });
                                    onMapModalOpen();
                                  }
                                }}
                              >
                                View on Map
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    )}

                    {dayActivities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-default-50 rounded-3xl border-2 border-dashed border-divider">
                        <IoCalendarClearOutline
                          size={48}
                          className="text-default-300 mb-4"
                        />
                        <p className="font-bold text-default-600">
                          No activities planned
                        </p>
                        <p className="text-sm text-default-400">
                          Add something to do on {tripDays[selectedDay]?.label}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col relative pl-4 pb-4"
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-divider" />
                        {(() => {
                          const parseDuration = (d: string) => {
                            let total = 0;
                            const h = d.match(/(\d+)h/);
                            const m = d.match(/(\d+)m/);
                            if (h) total += parseInt(h[1]) * 60;
                            if (m) total += parseInt(m[1]);
                            if (!h && !m) total += parseInt(d) || 0;
                            return total;
                          };
                          const parseTime = (t: string) => {
                            const [h, m] = t.split(":").map(Number);
                            return h * 60 + m;
                          };
                          return dayActivities.map((act, index) => {
                            const start = parseTime(act.startTime);
                            const end = start + parseDuration(act.duration);
                            const hasConflict = dayActivities.some(
                              (other, oIdx) => {
                                if (index === oIdx) return false;
                                const oStart = parseTime(other.startTime);
                                const oEnd =
                                  oStart + parseDuration(other.duration);
                                return start < oEnd && end > oStart;
                              },
                            );
                            return (
                              <motion.div
                                layout
                                key={act.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "move";
                                  setTimeout(
                                    () => setDraggedActivityId(act.id),
                                    0,
                                  );
                                }}
                                onDragEnd={() => setDraggedActivityId(null)}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = "move";
                                }}
                                onDrop={(e) => handleDrop(e, act.id)}
                                className={`relative pl-12 py-3 cursor-grab active:cursor-grabbing ${draggedActivityId === act.id ? "opacity-40" : "opacity-100"}`}
                              >
                                <div className="absolute left-[23px] top-8 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10" />
                                <Card
                                  className={`bg-background shadow-md border-2 transition-all ${
                                    hasConflict
                                      ? "border-warning/50 shadow-warning/10"
                                      : "border-divider/50"
                                  } rounded-2xl hover:shadow-lg hover:border-primary/50`}
                                >
                                <CardBody className="p-4 flex flex-row items-center gap-4">
                                  <div className="text-default-300">
                                    <IoMenuOutline size={24} />
                                  </div>
                                  <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-lg">
                                        {act.title}
                                      </p>
                                      {hasConflict && (
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color="warning"
                                          className="font-bold h-5"
                                        >
                                          Time Conflict
                                        </Chip>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-default-500">
                                      <span className="flex items-center gap-1 font-medium">
                                        <IoTimeOutline className="text-primary" />{" "}
                                        {act.startTime}
                                      </span>
                                      {act.duration && (
                                        <span className="flex items-center gap-1 font-medium">
                                          <IoHourglassOutline className="text-secondary" />{" "}
                                          {act.duration}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                <Dropdown placement="bottom-end">
                                  <DropdownTrigger>
                                    <Button
                                      isIconOnly
                                      variant="light"
                                      size="sm"
                                      radius="full"
                                    >
                                      <IoEllipsisVertical size={18} />
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu aria-label="Activity Actions">
                                    <DropdownItem
                                      key="edit"
                                      className="text-primary font-bold"
                                      onPress={() =>
                                        handleInitiateEditActivity(act)
                                      }
                                    >
                                      Edit Details
                                    </DropdownItem>
                                    <DropdownItem
                                      key="move"
                                      className="text-default-700 h-auto py-2"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-default-500 uppercase">
                                          Move to Day
                                        </span>
                                        <div className="grid grid-cols-3 gap-2">
                                          {tripDays.map((d) => (
                                            <Button
                                              key={d.index}
                                              size="sm"
                                              variant={
                                                d.index === selectedDay
                                                  ? "solid"
                                                  : "flat"
                                              }
                                              color={
                                                d.index === selectedDay
                                                  ? "primary"
                                                  : "default"
                                              }
                                              onPress={() =>
                                                handleMoveActivity(
                                                  itineraryTrip!.id,
                                                  act.id,
                                                  d.index,
                                                )
                                              }
                                            >
                                              {d.index + 1}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    </DropdownItem>
                                    <DropdownItem
                                      key="delete"
                                      color="danger"
                                      className="text-danger mt-2"
                                      onPress={() =>
                                        handleDeleteActivity(
                                          itineraryTrip!.id,
                                          act.id,
                                        )
                                      }
                                    >
                                      Delete Activity
                                    </DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              </CardBody>
                            </Card>
                          </motion.div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="bg-default-50 p-4 rounded-3xl mt-auto">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-default-500 mb-3 ml-2">
                      Add New Activity
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <Input
                          placeholder="What's the plan? (e.g. Louvre Museum)"
                          value={newActivityTitle}
                          onValueChange={setNewActivityTitle}
                          variant="bordered"
                          size="sm"
                          label="Title"
                          classNames={{
                            inputWrapper: "rounded-xl bg-background",
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          type="time"
                          value={newActivityTime}
                          onValueChange={setNewActivityTime}
                          variant="bordered"
                          size="sm"
                          label="Time"
                          classNames={{
                            inputWrapper: "rounded-xl bg-background",
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="e.g. 2h 30m"
                          value={newActivityDuration}
                          onValueChange={setNewActivityDuration}
                          variant="bordered"
                          size="sm"
                          label="Duration"
                          classNames={{
                            inputWrapper: "rounded-xl bg-background",
                          }}
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pb-1">
                        <Button
                          color="primary"
                          isIconOnly
                          className="rounded-xl w-full sm:w-10 h-10 shadow-md"
                          onPress={handleAddActivity}
                          isDisabled={!newActivityTitle || !newActivityTime}
                        >
                          <IoAdd size={22} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mt-3 pt-3 border-t border-divider/50">
                      <div className="sm:col-span-5 text-sm text-default-400 font-medium ml-2">
                        Location Coordinates (for map route)
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Latitude"
                          value={newActivityLat}
                          onValueChange={setNewActivityLat}
                          variant="bordered"
                          size="sm"
                          classNames={{
                            inputWrapper: "rounded-xl bg-background border-divider/30",
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Longitude"
                          value={newActivityLng}
                          onValueChange={setNewActivityLng}
                          variant="bordered"
                          size="sm"
                          classNames={{
                            inputWrapper: "rounded-xl bg-background border-divider/30",
                          }}
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          isIconOnly
                          className="rounded-xl w-full sm:w-10 h-8"
                          onPress={() => handleOpenPicker(false)}
                          title="Select from map"
                        >
                          <IoLocationOutline size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="secondary"
                          isIconOnly
                          className="rounded-xl w-full sm:w-10 h-8"
                          onPress={() => handleMockLocation(false)}
                          title="Mock location near destination"
                        >
                          <IoMapOutline size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditActivityOpen}
        onOpenChange={onEditActivityOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic">
                Edit Activity
              </ModalHeader>
              <ModalBody className="px-6 py-4 flex flex-col gap-5">
                <Input
                  label="Title"
                  placeholder="e.g. Louvre Museum"
                  variant="bordered"
                  value={editActivityTitle}
                  onValueChange={setEditActivityTitle}
                  classNames={{ inputWrapper: "rounded-xl bg-background" }}
                  isRequired
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    label="Start Time"
                    variant="bordered"
                    value={editActivityTime}
                    onValueChange={setEditActivityTime}
                    classNames={{ inputWrapper: "rounded-xl bg-background" }}
                    isRequired
                  />
                  <Input
                    label="Duration"
                    placeholder="e.g. 2h 30m"
                    variant="bordered"
                    value={editActivityDuration}
                    onValueChange={setEditActivityDuration}
                    classNames={{ inputWrapper: "rounded-xl bg-background" }}
                  />
                </div>
                <Divider className="my-2" />
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-default-500 ml-1">
                    Location Coordinates
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <Input
                        label="Latitude"
                        placeholder="e.g. 48.85"
                        variant="bordered"
                        value={editActivityLat}
                        onValueChange={setEditActivityLat}
                        classNames={{ inputWrapper: "rounded-xl bg-background" }}
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <Input
                        label="Longitude"
                        placeholder="e.g. 2.29"
                        variant="bordered"
                        value={editActivityLng}
                        onValueChange={setEditActivityLng}
                        classNames={{ inputWrapper: "rounded-xl bg-background" }}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end pt-5 gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        isIconOnly
                        className="rounded-xl w-full h-10"
                        onPress={() => handleOpenPicker(true)}
                        title="Select from map"
                      >
                        <IoLocationOutline size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        isIconOnly
                        className="rounded-xl w-full h-10"
                        onPress={() => handleMockLocation(true)}
                        title="Mock location near destination"
                      >
                        <IoMapOutline size={18} />
                      </Button>
                    </div>
                  </div>
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
                  onPress={() => handleSaveEditActivity(onClose)}
                  className="font-bold rounded-xl shadow-lg"
                  isDisabled={!editActivityTitle || !editActivityTime}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onOpenChange={onMapModalOpenChange}
        size="2xl"
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic">
                Location: {mapModalData?.name}
              </ModalHeader>
              <ModalBody className="px-6 py-4">
                {mapModalData && (
                  <MapComponent
                    lat={mapModalData.lat}
                    lng={mapModalData.lng}
                    name={mapModalData.name}
                  />
                )}
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button
                  color="primary"
                  onPress={onClose}
                  className="font-bold rounded-xl"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Location Picker Modal */}
      <Modal
        isOpen={isPickerOpen}
        onOpenChange={onPickerOpenChange}
        size="3xl"
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic text-primary">
                Select Activity Location
              </ModalHeader>
              <ModalBody className="px-6 py-4">
                <MapComponent
                  lat={pickerConfig?.initialLat}
                  lng={pickerConfig?.initialLng}
                  isSelecting={true}
                  onLocationSelect={handleLocationPicked}
                />
                <p className="text-center text-sm text-default-500 font-medium mt-4">
                  Zoom and pan to find the exact spot, then click to set the coordinates.
                </p>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button
                  color="primary"
                  onPress={onClose}
                  className="font-bold rounded-xl px-12 shadow-lg shadow-primary/20"
                >
                  Done Selecting
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Route Map Modal */}
      <Modal
        isOpen={isRouteMapOpen}
        onOpenChange={onRouteMapOpenChange}
        size="4xl"
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-6 pt-6 text-2xl font-bold italic">
                Daily Route Visualization
              </ModalHeader>
              <ModalBody className="px-6 py-4">
                {routeMapData && (
                  <MapComponent points={routeMapData.points} />
                )}
                <div className="mt-4 p-4 bg-default-50 rounded-2xl flex flex-col gap-2">
                  <p className="text-xs font-bold text-default-400 uppercase tracking-widest">
                    Route Sequence
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {routeMapData?.points.map((p, idx) => (
                      <Chip
                        key={idx}
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="font-bold"
                      >
                        {idx + 1}. {p.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button
                  color="primary"
                  onPress={onClose}
                  className="font-bold rounded-xl"
                >
                  Close Route
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

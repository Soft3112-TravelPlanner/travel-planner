import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
} from "@heroui/react";
import {
  IoAdd,
  IoPencil,
  IoTrash,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoShieldCheckmark,
  IoTimeOutline,
  IoImageOutline,
  IoMapOutline,
  IoRestaurantOutline,
  IoFlagOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";
import {
  REVIEWS_STORAGE_KEY,
  MODERATION_LOGS_KEY,
  PROFILE_STORAGE_KEY,
} from "@/constants/storage";
import type { Destination, Landmark, Restaurant } from "@/interfaces";
import { MapComponent } from "@/components/mapComponent";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminComponent,
});

function AdminComponent() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const token = (() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      return stored ? JSON.parse(stored).token : null;
    } catch {
      return null;
    }
  })();

  const {
    isOpen: isDestModalOpen,
    onOpen: onDestModalOpen,
    onOpenChange: onDestModalOpenChange,
  } = useDisclosure();
  const [editingDest, setEditingDest] = useState<Partial<Destination> | null>(
    null,
  );

  const {
    isOpen: isPickerOpen,
    onOpen: onPickerOpen,
    onOpenChange: onPickerOpenChange,
  } = useDisclosure();
  const [pickerConfig, setPickerConfig] = useState<{
    type: "destination" | "landmark" | "restaurant";
    index?: number;
    initialCenter?: { lat: number; lng: number };
  } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    // Fetch destinations from backend
    try {
      const response = await fetch("http://localhost:3001/api/destinations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      }
    } catch (error) {
      console.error("Failed to fetch destinations", error);
    }

    // Fetch reviews from backend
    try {
      const response = await fetch("http://localhost:3001/api/reviews/all", { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }

    const storedLogs = localStorage.getItem(MODERATION_LOGS_KEY);
    setLogs(storedLogs ? JSON.parse(storedLogs) : []);
  };

  const handleSaveDest = async (onClose: () => void) => {
    if (!editingDest?.name || !editingDest.city) return;

    const payload = {
      name: editingDest.name,
      description: editingDest.description || "",
      city: editingDest.city || "",
      country: editingDest.country || "",
      lat: editingDest.coordinates?.lat || 0,
      lng: editingDest.coordinates?.lng || 0,
      estimated_cost: editingDest.estimatedBudget || 0,
      rating: editingDest.averageRating || 4.5,
      localRestaurants: editingDest.localRestaurants || []
    };

    const method = editingDest.id ? "PUT" : "POST";
    const url = editingDest.id 
      ? `http://localhost:3001/api/destinations/${editingDest.id}` 
      : "http://localhost:3001/api/destinations";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        refreshData();
        onClose();
      }
    } catch (error) {
      console.error("Failed to save destination", error);
    }
  };

  const handleDeleteDest = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this destination?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/destinations/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          refreshData();
        }
      } catch (error) {
        console.error("Failed to delete destination", error);
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const deletedReview = reviews.find((r) => String(r.id) === String(reviewId));
          
          // Yapan adminin e-posta bilgisini bulma
          let adminName = "Admin";
          try {
            const profileStr = localStorage.getItem("travel-planner-profile");
            if (profileStr) {
              const profile = JSON.parse(profileStr);
              if (profile.user && profile.user.email) {
                adminName = profile.user.email.split('@')[0];
              }
            }
          } catch(e) {}

          // Log moderation action
          const newLog = {
            id: Date.now().toString(),
            action: "DELETE_REVIEW",
            targetId: reviewId,
            targetContent: deletedReview?.text || "N/A",
            adminName: adminName,
            timestamp: new Date().toISOString(),
          };
          const updatedLogs = [newLog, ...logs];
          localStorage.setItem(MODERATION_LOGS_KEY, JSON.stringify(updatedLogs));
          setLogs(updatedLogs);

          refreshData();
        } else {
          alert("Failed to delete review on server.");
        }
      } catch (error) {
        console.error("Failed to delete review", error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingDest((prev) => ({
          ...prev,
          mainImageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenPicker = (
    type: "destination" | "landmark" | "restaurant",
    index?: number,
  ) => {
    let center = editingDest?.coordinates;
    
    if (type === "landmark" && index !== undefined) {
      const landmark = editingDest?.landmarks?.[index];
      if (landmark?.coordinates && (landmark.coordinates.lat !== 0 || landmark.coordinates.lng !== 0)) {
        center = landmark.coordinates;
      }
    } else if (type === "restaurant" && index !== undefined) {
      const restaurant = editingDest?.localRestaurants?.[index];
      if (restaurant?.coordinates && (restaurant.coordinates.lat !== 0 || restaurant.coordinates.lng !== 0)) {
        center = restaurant.coordinates;
      }
    }

    if (!center || (center.lat === 0 && center.lng === 0)) {
      // Default to a known place (Istanbul) if not set
      center = { lat: 41.0082, lng: 28.9784 };
    }

    setPickerConfig({ type, index, initialCenter: center });
    onPickerOpen();
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    if (!pickerConfig || !editingDest) return;

    if (pickerConfig.type === "destination") {
      setEditingDest((p) => ({ ...p, coordinates: { lat, lng } }));
    } else if (
      pickerConfig.type === "landmark" &&
      pickerConfig.index !== undefined
    ) {
      const updated = [...(editingDest.landmarks || [])];
      updated[pickerConfig.index].coordinates = { lat, lng };
      setEditingDest((p) => ({ ...p, landmarks: updated }));
    } else if (
      pickerConfig.type === "restaurant" &&
      pickerConfig.index !== undefined
    ) {
      const updated = [...(editingDest.localRestaurants || [])];
      updated[pickerConfig.index].coordinates = { lat, lng };
      setEditingDest((p) => ({ ...p, localRestaurants: updated }));
    }

    onPickerOpenChange();
  };

  // Hedef ID yerine hedefin adını getiren yardımcı fonksiyon
  const getDestinationName = (id: string) => {
    const dest = destinations.find((d) => String(d.id) === String(id));
    return dest ? dest.name : id;
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full pb-20">
      <section className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight italic flex items-center gap-3">
            <IoShieldCheckmark className="text-primary" />
            Admin <span className="text-primary not-italic">Control Panel</span>
          </h1>
          <p className="text-default-500 mt-2">
            Manage your catalog and moderate user content.
          </p>
        </motion.div>
      </section>

      <Tabs
        aria-label="Admin Sections"
        variant="underlined"
        color="primary"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary font-bold",
        }}
      >
        <Tab key="destinations" title="Destinations">
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold italic">Destination Catalog</h2>
              <Button
                color="primary"
                startContent={<IoAdd size={20} />}
                onPress={() => {
                  setEditingDest({
                    landmarks: [],
                    localRestaurants: [],
                    coordinates: { lat: 0, lng: 0 },
                  });
                  onDestModalOpen();
                }}
                className="font-bold rounded-xl"
              >
                Add Destination
              </Button>
            </div>

            <Card className="border-none bg-background shadow-xl rounded-[2rem]">
              <CardBody className="p-0 overflow-hidden">
                <Table aria-label="Destinations table" removeWrapper>
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>LOCATION</TableColumn>
                    <TableColumn>BUDGET</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {destinations.map((dest) => (
                      <TableRow key={dest.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={dest.mainImageUrl}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-bold">{dest.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dest.city}, {dest.country}
                        </TableCell>
                        <TableCell>${dest.estimatedBudget}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="primary"
                              onPress={() => {
                                setEditingDest(dest);
                                onDestModalOpen();
                              }}
                            >
                              <IoPencil />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => handleDeleteDest(dest.id)}
                            >
                              <IoTrash />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="reviews" title="Review Moderation">
          <div className="flex flex-col gap-6 mt-6">
            <h2 className="text-xl font-bold italic">User Reviews</h2>
            <Card className="border-none bg-background shadow-xl rounded-[2rem]">
              <CardBody className="p-0 overflow-hidden">
                <Table aria-label="Reviews moderation table" removeWrapper>
                  <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>DESTINATION</TableColumn>
                    <TableColumn>CONTENT</TableColumn>
                    <TableColumn>RATING</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-bold">
                          {review.userName}
                        </TableCell>
                        <TableCell>{getDestinationName(review.destinationId)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.text}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="font-bold"
                          >
                            {review.rating} Stars
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDeleteReview(review.id)}
                          >
                            <IoTrash />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="logs" title="Moderation Logs">
          <div className="flex flex-col gap-6 mt-6">
            <h2 className="text-xl font-bold italic">Audit Trail</h2>
            <div className="flex flex-col gap-4">
              {logs.map((log) => (
                <Card
                  key={log.id}
                  className="border-none bg-default-50 shadow-sm rounded-2xl"
                >
                  <CardBody className="flex flex-row items-center gap-4 py-4 px-6">
                    <div className="p-2 bg-danger/10 text-danger rounded-lg">
                      <IoTrash size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">
                        {log.adminName}{" "}
                        <span className="text-default-500 font-normal">
                          deleted a review
                        </span>
                      </p>
                      <p className="text-xs text-default-400 mt-1 italic line-clamp-1">
                        "{log.targetContent}"
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-default-400 flex items-center gap-1 justify-end">
                        <IoTimeOutline />
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-12 text-default-400 italic">
                  No logs found.
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Destination Add/Edit Modal */}
      <Modal
        isOpen={isDestModalOpen}
        onOpenChange={onDestModalOpenChange}
        size="3xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem] p-2">
          {(onClose) => (
            <>
              <ModalHeader className="px-6 pt-6 text-2xl font-bold italic">
                {editingDest?.id ? "Edit Destination" : "New Destination"}
              </ModalHeader>
              <ModalBody className="px-6 py-4 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="e.g. Historic Peninsula"
                    value={editingDest?.name || ""}
                    onValueChange={(v) =>
                      setEditingDest((p) => ({ ...p, name: v }))
                    }
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl" }}
                  />
                  <Input
                    label="City"
                    placeholder="e.g. Istanbul"
                    value={editingDest?.city || ""}
                    onValueChange={(v) =>
                      setEditingDest((p) => ({ ...p, city: v }))
                    }
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Country"
                    placeholder="e.g. Turkey"
                    value={editingDest?.country || ""}
                    onValueChange={(v) =>
                      setEditingDest((p) => ({ ...p, country: v }))
                    }
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl" }}
                  />
                  <Input
                    label="Budget ($)"
                    type="number"
                    step="any"
                    value={editingDest?.estimatedBudget?.toString() || ""}
                    onValueChange={(v) =>
                      setEditingDest((p) => ({
                        ...p,
                        estimatedBudget: Number(v),
                      }))
                    }
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl" }}
                  />
                </div>
                <Textarea
                  label="Description"
                  placeholder="Tell us about this place..."
                  value={editingDest?.description || ""}
                  onValueChange={(v) =>
                    setEditingDest((p) => ({ ...p, description: v }))
                  }
                  variant="bordered"
                  classNames={{ inputWrapper: "rounded-xl" }}
                />

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-default-500">
                    Main Image
                  </p>
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-divider flex items-center justify-center overflow-hidden">
                      {editingDest?.mainImageUrl ? (
                        <img
                          src={editingDest.mainImageUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoImageOutline
                          size={32}
                          className="text-default-300"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Image URL or upload below"
                        value={editingDest?.mainImageUrl || ""}
                        onValueChange={(v) =>
                          setEditingDest((p) => ({ ...p, mainImageUrl: v }))
                        }
                        variant="bordered"
                        size="sm"
                        classNames={{ inputWrapper: "rounded-xl mb-2" }}
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        className="rounded-lg"
                        onPress={() =>
                          document.getElementById("admin-img-upload")?.click()
                        }
                      >
                        Upload Image
                      </Button>
                      <input
                        id="admin-img-upload"
                        type="file"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>

                <Divider />
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold italic">Landmarks</h4>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        const newLandmark: Landmark = {
                          id: Date.now().toString(),
                          name: "New Landmark",
                          type: "Point of Interest",
                          coordinates: {
                            lat: editingDest?.coordinates?.lat || 0,
                            lng: editingDest?.coordinates?.lng || 0,
                          },
                        };
                        setEditingDest((p) => ({
                          ...p,
                          landmarks: [...(p?.landmarks || []), newLandmark],
                        }));
                      }}
                    >
                      Add Landmark
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {editingDest?.landmarks?.map((l, idx) => (
                      <div
                        key={l.id}
                        className="flex flex-col gap-3 bg-default-50 p-4 rounded-2xl border-2 border-divider/50"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            size="sm"
                            label="Landmark Name"
                            value={l.name}
                            onValueChange={(v) => {
                              const updated = [...editingDest.landmarks!];
                              updated[idx].name = v;
                              setEditingDest((p) => ({
                                ...p,
                                landmarks: updated,
                              }));
                            }}
                            className="flex-1"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => {
                              const updated = editingDest.landmarks!.filter(
                                (_, i) => i !== idx,
                              );
                              setEditingDest((p) => ({
                                ...p,
                                landmarks: updated,
                              }));
                            }}
                          >
                            <IoTrash />
                          </Button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            size="sm"
                            label="Type"
                            value={l.type}
                            onValueChange={(v) => {
                              const updated = [...editingDest.landmarks!];
                              updated[idx].type = v;
                              setEditingDest((p) => ({
                                ...p,
                                landmarks: updated,
                              }));
                            }}
                            className="flex-1"
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] font-bold text-default-400">
                              COORD: {l.coordinates.lat.toFixed(4)},{" "}
                              {l.coordinates.lng.toFixed(4)}
                            </span>
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              isIconOnly
                              onClick={() => handleOpenPicker("landmark", idx)}
                            >
                              <IoMapOutline />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold italic flex items-center gap-2">
                      <IoRestaurantOutline className="text-success" />
                      Local Dining
                    </h4>
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      onPress={() => {
                        const newRes: Restaurant = {
                          id: Date.now().toString(),
                          name: "New Restaurant",
                          cuisine: "Local",
                          rating: 4.5,
                          address: "",
                          priceRange: "$$",
                          coordinates: {
                            lat: editingDest?.coordinates?.lat || 0,
                            lng: editingDest?.coordinates?.lng || 0,
                          },
                        };
                        setEditingDest((p) => ({
                          ...p,
                          localRestaurants: [
                            ...(p?.localRestaurants || []),
                            newRes,
                          ],
                        }));
                      }}
                    >
                      Add Restaurant
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {editingDest?.localRestaurants?.map((r, idx) => (
                      <div
                        key={r.id}
                        className="flex flex-col gap-3 bg-default-50 p-4 rounded-2xl border-2 border-divider/50"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            size="sm"
                            label="Restaurant Name"
                            value={r.name}
                            onValueChange={(v) => {
                              const updated = [
                                ...editingDest.localRestaurants!,
                              ];
                              updated[idx].name = v;
                              setEditingDest((p) => ({
                                ...p,
                                localRestaurants: updated,
                              }));
                            }}
                            className="flex-1"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => {
                              const updated =
                                editingDest.localRestaurants!.filter(
                                  (_, i) => i !== idx,
                                );
                              setEditingDest((p) => ({
                                ...p,
                                localRestaurants: updated,
                              }));
                            }}
                          >
                            <IoTrash />
                          </Button>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Input
                            size="sm"
                            label="Cuisine"
                            value={r.cuisine}
                            onValueChange={(v) => {
                              const updated = [
                                ...editingDest.localRestaurants!,
                              ];
                              updated[idx].cuisine = v;
                              setEditingDest((p) => ({
                                ...p,
                                localRestaurants: updated,
                              }));
                            }}
                            className="flex-1"
                          />
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] font-bold text-default-400">
                              COORD: {r.coordinates.lat.toFixed(4)},{" "}
                              {r.coordinates.lng.toFixed(4)}
                            </span>
                            <Button
                              size="sm"
                              variant="flat"
                              color="success"
                              isIconOnly
                              onClick={() =>
                                handleOpenPicker("restaurant", idx)
                              }
                            >
                              <IoMapOutline />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold italic flex items-center gap-2">
                    <IoMapOutline className="text-primary" />
                    Coordinates (Leaflet Center)
                  </h4>
                  <div className="flex gap-4 items-center">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <Input
                        label="Latitude"
                        type="number"
                        step="any"
                        value={editingDest?.coordinates?.lat?.toString() || "0"}
                        onValueChange={(v) =>
                          setEditingDest((p) => ({
                            ...p,
                            coordinates: { ...p.coordinates!, lat: Number(v) },
                          }))
                        }
                        variant="bordered"
                      />
                      <Input
                        label="Longitude"
                        type="number"
                        step="any"
                        value={editingDest?.coordinates?.lng?.toString() || "0"}
                        onValueChange={(v) =>
                          setEditingDest((p) => ({
                            ...p,
                            coordinates: { ...p.coordinates!, lng: Number(v) },
                          }))
                        }
                        variant="bordered"
                      />
                    </div>
                    <Button
                      color="primary"
                      variant="flat"
                      className="h-14 font-bold"
                      startContent={<IoMapOutline size={20} />}
                      onPress={() => handleOpenPicker("destination")}
                    >
                      Pick
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="px-6 pb-6">
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  className="font-bold rounded-xl"
                  onPress={() => handleSaveDest(onClose)}
                >
                  Save Destination
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        isOpen={isPickerOpen}
        onOpenChange={onPickerOpenChange}
        size="4xl"
        backdrop="blur"
      >
        <ModalContent className="rounded-[2.5rem]">
          {(onClose) => (
            <>
              <ModalHeader className="px-8 pt-8 text-2xl font-bold italic">
                Select Location on Map
              </ModalHeader>
              <ModalBody className="px-8 py-6">
                <div className="h-[500px] w-full rounded-3xl overflow-hidden border-2 border-divider shadow-inner">
                  <MapComponent
                    isSelecting={true}
                    onLocationSelect={handleLocationSelect}
                    lat={pickerConfig?.initialCenter?.lat}
                    lng={pickerConfig?.initialCenter?.lng}
                    name="Initial Position"
                  />
                </div>
                <p className="text-default-500 text-sm mt-4 text-center font-medium">
                  Click anywhere on the map to set the coordinates for the{" "}
                  <strong>{pickerConfig?.type}</strong>.
                </p>
              </ModalBody>
              <ModalFooter className="px-8 pb-8">
                <Button variant="light" onPress={onClose} className="font-bold">
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

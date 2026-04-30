import { createFileRoute } from "@tanstack/react-router";
import { PROFILE_STORAGE_KEY } from "@/constants/storage";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Form,
  Button,
  Avatar,
  Divider,
  Select,
  SelectItem,
  Badge,
} from "@heroui/react";
import {
  IoCameraOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoFingerPrintOutline,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/profile/")({
  component: RouteComponent,
});

interface ProfileData {
  id?: string | number;
  name: string;
  surname?: string;
  tc?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  username?: string;
  avatar?: string;
  travelPreferences: string;
}

const defaultProfileData: ProfileData = {
  name: "Ahmet",
  surname: "Yılmaz",
  tc: "12345678901",
  birthDate: "1990-01-01",
  phone: "+90 555 555 55 55",
  email: "ahmet@gmail.com",
  username: "ahmet123",
  travelPreferences: "Cultural Tour",
};

const TRAVEL_PREFERENCES = [
  "Cultural Tour",
  "Nature Retreat",
  "Adventure Getaway",
  "Beach Holiday",
  "Gastronomy",
];

function RouteComponent() {
  const [draft, setDraft] = useState<ProfileData>(defaultProfileData);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        if (authData.token) {
          fetchProfile(authData.token);
        }
      } catch (e) {
        console.error("Profile parse error", e);
      }
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setDraft({
          id: user.id,
          name: user.firstName || "",
          surname: user.lastName || "",
          tc: user.tc || "",
          birthDate: user.birthDate || "",
          phone: user.phone || "",
          email: user.email || "",
          username: user.username || "",
          avatar: user.avatar ? `http://localhost:3001${user.avatar}` : "",
          travelPreferences: user.preferences || "Cultural Tour",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const saveProfile = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draft));
      setIsSaving(false);
    }
  };

  const setAvatarFromFile = async (file: File) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const token = stored ? JSON.parse(stored).token : null;

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("http://localhost:3001/user/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDraft((v) => ({ ...v, avatar: `http://localhost:3001${data.avatar}` }));
      }
    } catch (error) {
      console.error("Failed to upload avatar", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-12 p-6 max-w-5xl mx-auto w-full pb-20">
      <section className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight italic">
              Account <span className="text-primary not-italic">Settings</span>
            </h1>
            <p className="text-default-500 mt-2">
              Manage your personal information and preferences.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="flat"
              color="danger"
              className="font-bold rounded-2xl"
              startContent={<IoTrashOutline size={20} />}
              onPress={() => setDraft(defaultProfileData)}
            >
              Reset
            </Button>
            <Button
              color="primary"
              className="font-bold rounded-2xl shadow-lg shadow-primary/20 px-8"
              startContent={<IoSaveOutline size={20} />}
              onPress={() => saveProfile()}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
        {/* Profile Sidebar */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-8"
        >
          <Card className="border-none bg-background shadow-xl rounded-[2.5rem] p-6 overflow-visible">
            <CardBody className="flex flex-col items-center gap-6 overflow-visible">
              <div className="relative group">
                <Badge
                  content={<IoCameraOutline size={20} />}
                  color="primary"
                  placement="bottom-right"
                  className="w-10 h-10 border-4 border-background cursor-pointer"
                >
                  <Avatar
                    src={draft.avatar}
                    className="w-32 h-32 text-large shadow-2xl"
                    showFallback
                    fallback={<IoPersonOutline size={48} className="text-default-400" />}
                  />
                </Badge>
                <label className="absolute inset-0 cursor-pointer z-20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAvatarFromFile(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold italic">{draft.name} {draft.surname}</h3>
                <p className="text-default-500 text-sm">{draft.email}</p>
                {draft.id && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-default-100 text-default-600 text-xs font-bold tracking-tighter">
                    USER ID: #{draft.id}
                  </div>
                )}
              </div>

              <Divider className="my-2" />

              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-default-400 uppercase tracking-widest">Trips Planned</span>
                  <span className="text-sm font-black text-primary">12</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-default-400 uppercase tracking-widest">Destinations</span>
                  <span className="text-sm font-black text-secondary">24</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.section>

        {/* Form Area */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-8"
        >
          <Card className="border-none bg-background shadow-xl rounded-[2.5rem] p-4">
            <CardBody>
              <Form validationBehavior="native" onSubmit={saveProfile} className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h4 className="text-lg font-bold italic">Personal Information</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      labelPlacement="outside"
                      placeholder="Enter first name"
                      value={draft.name}
                      onValueChange={(v) => setDraft(p => ({ ...p, name: v }))}
                      variant="bordered"
                      startContent={<IoPersonOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                    <Input
                      label="Last Name"
                      labelPlacement="outside"
                      placeholder="Enter last name"
                      value={draft.surname}
                      onValueChange={(v) => setDraft(p => ({ ...p, surname: v }))}
                      variant="bordered"
                      startContent={<IoPersonOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="ID Number"
                      labelPlacement="outside"
                      placeholder="11-digit ID"
                      value={draft.tc}
                      onValueChange={(v) => setDraft(p => ({ ...p, tc: v }))}
                      variant="bordered"
                      startContent={<IoFingerPrintOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                    <Input
                      label="Birth Date"
                      labelPlacement="outside"
                      type="date"
                      value={draft.birthDate}
                      onValueChange={(v) => setDraft(p => ({ ...p, birthDate: v }))}
                      variant="bordered"
                      startContent={<IoCalendarOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                  </div>
                </div>

                <Divider />

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-secondary rounded-full" />
                    <h4 className="text-lg font-bold italic">Contact & Preferences</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Email Address"
                      labelPlacement="outside"
                      type="email"
                      value={draft.email}
                      isDisabled
                      variant="bordered"
                      startContent={<IoMailOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                    <Input
                      label="Username"
                      labelPlacement="outside"
                      value={draft.username}
                      isDisabled
                      variant="bordered"
                      startContent={<IoPersonOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      labelPlacement="outside"
                      placeholder="+90 555 555 55 55"
                      value={draft.phone}
                      onValueChange={(v) => setDraft(p => ({ ...p, phone: v }))}
                      variant="bordered"
                      startContent={<IoCallOutline className="text-default-400" />}
                      classNames={{ inputWrapper: "h-14 rounded-2xl" }}
                    />
                  </div>

                  <div>
                    <Select
                      label="Travel Preference"
                      labelPlacement="outside"
                      placeholder="Select your preference"
                      selectedKeys={[draft.travelPreferences]}
                      onSelectionChange={(keys) => setDraft(p => ({ ...p, travelPreferences: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      classNames={{ trigger: "h-14 rounded-2xl" }}
                    >
                      {TRAVEL_PREFERENCES.map((pref) => (
                        <SelectItem key={pref}>
                          {pref}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </Form>
            </CardBody>
          </Card>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success-50 text-success-600 p-4 rounded-2xl border border-success-200 text-center font-bold"
            >
              Profile updated successfully!
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Input, Form, Button } from "@heroui/react";

export const Route = createFileRoute("/_app/profile/")({
  component: RouteComponent,
});

interface ProfileData {
  name: string;
  surname?: string;
  tc?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  travelPreferences: string;
}

const defaultProfileData: ProfileData = {
  name: "Ahmet",
  surname: "Yılmaz",
  tc: "12345678901",
  birthDate: "1990-01-01",
  phone: "+90 555 555 55 55",
  email: "",
  travelPreferences: "Cultural Tour",
};

const COUNTRY_CODES = [
  { code: "+90", label: "TR" },
  { code: "+1", label: "US" },
  { code: "+44", label: "UK" },
  { code: "+49", label: "GB" },
];

const PHONE_LOCAL_FORMAT = /^\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const STORAGE_KEY = "travel-planner-profile";

function splitPhone(fullPhone: string) {
  const match = fullPhone.match(/^(\+\d{1,3})\s+(.*)$/);
  if (match) {
    return { code: match[1], local: match[2] };
  }
  return { code: "+90", local: fullPhone };
}

function RouteComponent() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfileData);
  const [draft, setDraft] = useState<ProfileData>(defaultProfileData);
  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const [countryCode, setCountryCode] = useState("+90");
  const [phoneLocal, setPhoneLocal] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ProfileData;
        setProfile(parsed);
        setDraft(parsed);
        const { code, local } = splitPhone(parsed.phone || "+90 ");
        setCountryCode(code);
        setPhoneLocal(local);
      } catch (e) {
        console.error("Profile parse error", e);
      }
    } else {
      setDraft(defaultProfileData);
      const { code, local } = splitPhone(defaultProfileData.phone || "+90 ");
      setCountryCode(code);
      setPhoneLocal(local);
    }
  }, []);

  const saveProfile = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (phoneLocal && !PHONE_LOCAL_FORMAT.test(phoneLocal)) {
      setPhoneError("Phone must be in 555 555 55 55 format");
      return;
    }
    if (draft.email && !draft.email.endsWith("@gmail.com")) {
      setEmailError("Email must end with @gmail.com");
      return;
    }

    const updated = {
      ...draft,
      phone: `${countryCode} ${phoneLocal}`.trim(),
    };
    setProfile(updated);
    setDraft(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const setAvatarFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setDraft((v) => ({ ...v, avatar: e.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-4 shadow-lg">
        <CardHeader className="flex justify-center pb-0">
          <h2 className="text-2xl font-bold">Profile</h2>
        </CardHeader>

        <CardBody>
          <Form validationBehavior="native" onSubmit={saveProfile} className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[120px_1fr] w-full">
              <div className="flex flex-col items-center gap-2 text-center mt-2">
                {draft.avatar ? (
                  <img src={draft.avatar} alt="Avatar" className="h-28 w-28 rounded-full border object-cover" />
                ) : (
                  <div className="h-28 w-28 rounded-full border bg-slate-200 flex items-center justify-center text-3xl text-slate-500">?</div>
                )}
                <label className="w-full bg-slate-100 border rounded px-2 py-1 text-xs text-slate-600 cursor-pointer text-center hover:bg-slate-200 transition-colors">
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
                  <span className="text-xs">Choose File</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDraft((v) => ({ ...v, avatar: "" }))}
                  className="rounded bg-black text-white px-3 py-1 text-xs hover:bg-slate-800 transition-colors"
                >
                  Remove Avatar
                </button>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={draft.name}
                    onChange={(e) => setDraft((v) => ({ ...v, name: e.target.value }))}
                    variant="bordered"
                    className="w-full"
                  />
                  <Input
                    label="Last Name"
                    value={draft.surname ?? ""}
                    onChange={(e) => setDraft((v) => ({ ...v, surname: e.target.value }))}
                    variant="bordered"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID Number"
                    value={draft.tc ?? ""}
                    onChange={(e) => setDraft((v) => ({ ...v, tc: e.target.value }))}
                    variant="bordered"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    label="Date of Birth"
                    placeholder="mm/dd/yyyy"
                    value={draft.birthDate ?? ""}
                    onChange={(e) => setDraft((v) => ({ ...v, birthDate: e.target.value }))}
                    variant="bordered"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    value={phoneLocal}
                    onChange={(e) => {
                      const phoneValue = e.target.value;
                      setPhoneLocal(phoneValue);
                      if (phoneValue === "" || PHONE_LOCAL_FORMAT.test(phoneValue)) {
                        setPhoneError("");
                      } else {
                        setPhoneError("Phone must be in 555 555 55 55 format");
                      }
                    }}
                    isInvalid={!!phoneError}
                    errorMessage={phoneError}
                    variant="bordered"
                    className="w-full"
                    maxLength={14}
                    startContent={
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="outline-none border-0 bg-transparent text-default-400 text-small appearance-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.label} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={draft.email ?? ""}
                    onChange={(e) => {
                      const emailValue = e.target.value;
                      setDraft((v) => ({ ...v, email: emailValue }));
                      if (emailValue === "" || emailValue.endsWith("@gmail.com")) {
                        setEmailError("");
                      } else {
                        setEmailError("Email must end with @gmail.com");
                      }
                    }}
                    isInvalid={!!emailError}
                    errorMessage={emailError}
                    variant="bordered"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Travel Preference</label>
                    <select
                      value={draft.travelPreferences}
                      onChange={(e) => setDraft((v) => ({ ...v, travelPreferences: e.target.value }))}
                      className="w-full border-2 border-default-200 hover:border-default-400 focus:border-black rounded-xl px-3 py-3 text-sm focus:outline-none transition-colors bg-transparent"
                    >
                      <option>Cultural Tour</option>
                      <option>Nature Retreat</option>
                      <option>Adventure Getaway</option>
                      <option>Beach Holiday</option>
                      <option>Gastronomy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              isDisabled={Boolean(phoneError || emailError)}
              className="w-full mt-2"
            >
              Update Profile
            </Button>
          </Form>

          {saved ? <p className="mt-4 text-green-600 text-center font-medium">Profile successfully saved!</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}
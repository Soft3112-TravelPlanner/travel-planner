import { Button, Chip } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState(0);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center gap-4 p-5">
      <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Travel Planner Ana Sayfa</h1>
        <p className="mb-4 text-slate-600">Profil düzenleme, login ve kayıt rotalarına yönlendirme.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/auth/login" className="rounded bg-blue-600 text-white px-4 py-2">Login</a>
          <a href="/auth/register" className="rounded bg-green-600 text-white px-4 py-2">Register</a>
          <a href="/profile" className="rounded bg-indigo-600 text-white px-4 py-2">Edit Profile</a>
          <a href="/auth/logout" className="rounded bg-red-600 text-white px-4 py-2">Sign Out</a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Chip>{value}</Chip>
        <Button onPress={() => setValue((v) => v + 1)}>Value: {value}</Button>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, CardBody, Button } from "@heroui/react";

export const Route = createFileRoute('/_app/auth/logout/')({
  component: RouteComponent,
})

const STORAGE_KEY = "travel-planner-profile";

export function RouteComponent() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const profileStr = localStorage.getItem(STORAGE_KEY);
      if (profileStr) {
        const { token } = JSON.parse(profileStr);
        if (token) {
          await fetch("http://localhost:3001/auth/logout", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        }
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Ortak kullanılan cihazlarda hesabımı korumak için güvenli çıkış
      localStorage.removeItem(STORAGE_KEY);
      navigate({ to: "/auth/login" });
    }
  };

  const handleCancel = () => {
    // İptal ederse geldiği sayfaya geri döner
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 shadow-lg text-center">
        <CardHeader className="flex justify-center pb-2">
          <h2 className="text-2xl font-bold">Sign Out</h2>
        </CardHeader>
        <CardBody className="gap-6 mt-2">
          <p className="text-slate-600 text-md">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex flex-col gap-3 mt-4">
            <Button color="danger" onPress={handleLogout} className="w-full font-medium">
              Yes, Sign Out
            </Button>
            <Button variant="flat" onPress={handleCancel} className="w-full font-medium">
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

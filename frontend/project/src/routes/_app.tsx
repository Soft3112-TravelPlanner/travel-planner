import { HeroUIProvider } from "@heroui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTheme } from "@heroui/use-theme";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  useTheme(); // Initialize theme
  return (
    <HeroUIProvider>
      <div className="min-h-screen h-0">
        <Outlet />
      </div>
    </HeroUIProvider>
  );
}

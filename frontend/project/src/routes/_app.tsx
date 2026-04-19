import { Button, HeroUIProvider } from "@heroui/react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useTheme } from "@heroui/use-theme";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  useTheme(); // Initialize theme
  return (
    <HeroUIProvider>
      <div className="min-h-screen h-0 flex flex-col">
        <div className=" min-h-20 bg-foreground-100 flex items-center justify-center gap-4">
          <Button className="font-bold" as={Link} to="/auth/login">
            Login
          </Button>
          <Button className="font-bold" as={Link} to="/auth/register">
            Register
          </Button>
          <Button className="font-bold" as={Link} to="/search">
            Search
          </Button>
          <Button className="font-bold" as={Link} to="/favorites">
            Favorites
          </Button>
          <Button className="font-bold" as={Link} to="/trips">
            Trips
          </Button>
        </div>
        <Outlet />
      </div>
    </HeroUIProvider>
  );
}

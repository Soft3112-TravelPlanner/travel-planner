import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, HeroUIProvider } from "@heroui/react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useTheme } from "@heroui/use-theme";
import { IoAirplane, IoSearch, IoHeart, IoMap, IoPerson, IoLogOut, IoWallet, IoShieldCheckmark } from "react-icons/io5";
import { useState, useEffect } from "react";
import { PROFILE_STORAGE_KEY } from "@/constants/storage";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

export function RouteComponent() {
  useTheme(); // Initialize theme
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("travel-planner-is-admin") === "true");
    };
    checkAdmin();
    // Also listen for storage changes in same window
    window.addEventListener("storage", checkAdmin);
    // Custom event for same-page updates
    const interval = setInterval(checkAdmin, 1000); 
    
    return () => {
      window.removeEventListener("storage", checkAdmin);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const profileStr = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile?.token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
  }, []);
  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar 
          isBordered 
          maxWidth="xl" 
          className="bg-background/70 backdrop-blur-md sticky top-0 z-50"
        >
          <NavbarBrand>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                <IoAirplane size={22} className="-rotate-45" />
              </div>
              <p className="font-bold text-inherit text-xl tracking-tight italic">Travel<span className="text-primary not-italic">Sync</span></p>
            </Link>
          </NavbarBrand>

          <NavbarContent className="hidden sm:flex gap-8" justify="center">
            <NavbarItem>
              <Link to="/search" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-medium">
                <IoSearch size={18} />
                Explore
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link to="/trips" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-medium">
                <IoMap size={18} />
                My Trips
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link to="/favorites" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-medium">
                <IoHeart size={18} />
                Favorites
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link to="/budget" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors font-medium">
                <IoWallet size={18} />
                Budget
              </Link>
            </NavbarItem>
            {isAdmin && (
              <NavbarItem>
                <Link to="/admin" className="flex items-center gap-2 text-primary hover:text-primary-600 transition-colors font-bold">
                  <IoShieldCheckmark size={18} />
                  Admin
                </Link>
              </NavbarItem>
            )}
          </NavbarContent>

          <NavbarContent justify="end">
            {!isLoggedIn ? (
              <>
                <NavbarItem className="hidden lg:flex">
                  <Button as={Link} to="/auth/login" variant="light" className="font-semibold">
                    Login
                  </Button>
                </NavbarItem>
                <NavbarItem>
                  <Button as={Link} to="/auth/register" color="primary" variant="flat" className="font-bold">
                    Sign Up
                  </Button>
                </NavbarItem>
              </>
            ) : (
              <>
                <NavbarItem>
                  <Button isIconOnly as={Link} to="/profile" variant="light" radius="full">
                    <IoPerson size={20} />
                  </Button>
                </NavbarItem>
                <NavbarItem>
                  <Button as={Link} to="/auth/logout" variant="light" color="danger" className="font-semibold" startContent={<IoLogOut size={18} />}>
                    Logout
                  </Button>
                </NavbarItem>
              </>
            )}
          </NavbarContent>
        </Navbar>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-divider py-12 bg-default-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-1 rounded-md text-primary-foreground">
                  <IoAirplane size={18} className="-rotate-45" />
                </div>
                <p className="font-bold text-xl italic">Travel<span className="text-primary not-italic">Sync</span></p>
              </div>
              <p className="text-default-500 max-w-xs">
                Your ultimate companion for planning seamless adventures and discovering hidden gems across the globe.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-default-500 text-sm">
                <li><Link to="/search">Explore</Link></li>
                <li><Link to="/trips">My Trips</Link></li>
                <li><Link to="/favorites">Favorites</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-default-500 text-sm">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-divider text-center text-default-400 text-sm">
            &copy; {new Date().getFullYear()} TravelSync. All rights reserved.
          </div>
        </footer>
      </div>
    </HeroUIProvider>
  );
}

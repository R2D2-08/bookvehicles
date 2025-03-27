"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/services/context";
import ProtectedRoutes from "@/services/protected";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Toaster } from "sonner";

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Define routes with better matching capabilities
  const publicPaths = ["/", "/login", "/signup", "/signup/driver"];
  const adminPaths = ["/admin"];
  const driverPaths = ["/driverdash"];

  // Function to check if the current path matches a protected category
  const isPublicRoute = () => publicPaths.some(path => pathname === path);
  const isAdminRoute = () => adminPaths.some(path => pathname.startsWith(path));
  const isDriverRoute = () => driverPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <UserProvider>
      <Navbar />
      <Toaster position="top-right" richColors />
      {isPublicRoute() ? (
        children
      ) : isAdminRoute() ? (
        <ProtectedRoutes roles={["admin"]}>{children}</ProtectedRoutes>
      ) : isDriverRoute() ? (
        <ProtectedRoutes roles={["driver"]}>{children}</ProtectedRoutes>
      ) : (
        <ProtectedRoutes roles={["user", "driver", "admin"]}>
          {children}
        </ProtectedRoutes>
      )}
      <Footer />
    </UserProvider>
  );
} 
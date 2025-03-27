"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import ProtectedRoutes from "@/services/protected";
import { UserProvider } from "@/services/context";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Define routes with better matching capabilities
  const publicPaths = ["/", "/login", "/signup"];
  const adminPaths = ["/admin"];
  const driverPaths = ["/driverdash"];

  // Function to check if the current path matches a protected category
  const isPublicRoute = () => publicPaths.some(path => pathname === path);
  const isAdminRoute = () => adminPaths.some(path => pathname.startsWith(path));
  const isDriverRoute = () => driverPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {mounted ? (
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
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </body>
    </html>
  );
}

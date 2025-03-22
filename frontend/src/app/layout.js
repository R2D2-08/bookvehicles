"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import ProtectedRoutes from "@/services/protected";
import { UserProvider } from "@/services/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const publicRoutes = ["/", "/login", "/signup"];
  const adminRoutes = ["/admin"];
  const driverRoutes = ["/driverdash"];

  console.log("publicRoutes:", publicRoutes);
  console.log("pathname:", pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <Navbar />
          <Toaster position="top-right" richColors />
          {publicRoutes.includes(pathname) ? (
            children
          ) : adminRoutes.includes(pathname) ? (
            <ProtectedRoutes roles={["admin"]}>{children}</ProtectedRoutes>
          ) : driverRoutes.includes(pathname) ? (
            <ProtectedRoutes roles={["driver"]}>{children}</ProtectedRoutes>
          ) : (
            <ProtectedRoutes roles={["user", "driver", "admin"]}>{children}</ProtectedRoutes>
          )}
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}

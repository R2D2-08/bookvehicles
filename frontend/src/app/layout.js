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
  const publicRoutes = ["/", "/login", "/signup"];

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
            {publicRoutes.includes(pathname) ? (
              children
            ) : (
              <ProtectedRoutes>{children}</ProtectedRoutes>
            )}
            <Footer />
          </UserProvider>
        ) : (
          <div /> // Ensures <html> and <body> are always present
        )}
      </body>
    </html>
  );
}

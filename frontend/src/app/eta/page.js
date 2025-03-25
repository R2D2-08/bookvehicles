"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for Next.js navigation
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const socket = io("http://localhost:5000"); // Adjust if needed

// Custom icon for driver marker
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

export default function LiveETA() {
  const router = useRouter(); // Initialize router
  const totalTime = 10; // 3 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [driverLocation, setDriverLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default location

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    // Redirect after 3 minutes
    const timeout = setTimeout(() => {
      router.push("/ride");
    }, totalTime * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]); // Dependency array includes router

  useEffect(() => {
    // Listen for driver location updates
    socket.on("driver_location_update", ({ lat, lng }) => {
      setDriverLocation({ lat, lng });
    });

    return () => {
      socket.off("driver_location_update");
    };
  }, []);

  const progress = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <motion.div
        className="bg-gray-100 p-6 rounded-lg shadow-lg w-80 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-3">Driver is on the way</h1>
        <p className="text-lg text-gray-600 mb-4">
          Estimated Arrival: {minutes}:{seconds < 10 ? `0${seconds}` : seconds} min
        </p>
        <div className="w-72 h-3 bg-gray-300 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* OpenStreetMap with Leaflet */}
        <MapContainer
          center={[driverLocation.lat, driverLocation.lng]}
          zoom={13}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Driver&apos;s Location</Popup>
          </Marker>
        </MapContainer>
      </motion.div>
    </div>
  );
}

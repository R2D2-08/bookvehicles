"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Clock, MapPin, Phone, Car, User } from "lucide-react";
import { toast } from "sonner";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Custom dynamic component to set map view
const MapUpdater = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      return function SetViewOnChange({ coords }) {
        const map = useMap();
        useEffect(() => {
          if (coords) {
            map.setView([coords.lat, coords.lng], 15);
          }
        }, [coords, map]);
        return null;
      };
    }),
  { ssr: false }
);

export default function LiveETA() {
  const router = useRouter();
  const socketRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [driverLocation, setDriverLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);
  const [pickupIcon, setPickupIcon] = useState(null);
  const [rideInfo, setRideInfo] = useState(null);

  // Set up icons and client-side rendering flag
  useEffect(() => {
    setIsClient(true);

    // Get pickup location from localStorage
    const pickupCoords = JSON.parse(localStorage.getItem("pickLocCoordinates"));
    if (pickupCoords) {
      setPickupLocation({
        lat: parseFloat(pickupCoords[0]),
        lng: parseFloat(pickupCoords[1]),
      });
    }

    // Set initial driver location if available in localStorage
    const savedDriverLocation = localStorage.getItem("driverLocation");
    if (savedDriverLocation) {
      try {
        setDriverLocation(JSON.parse(savedDriverLocation));
      } catch (e) {
        console.error("Error parsing driver location:", e);
      }
    }

    // Import Leaflet and create custom icons
    import("leaflet").then((L) => {
      setCustomIcon(
        new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      );

      setPickupIcon(
        new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1180/1180058.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      );
    });
  }, []);

  // Set up WebSocket connection and listeners
  useEffect(() => {
    // Set up countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    // Set up socket connection
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["polling", "websocket"], // Start with polling, then upgrade to websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Connection handlers
    socket.on("connect", () => {
      console.log("Connected to socket server in ETA page");

      // Re-register as a rider when connected
      const userId = localStorage.getItem("userId");
      const driverId = localStorage.getItem("driverId");
      const requestId = localStorage.getItem("requestId");
      const rideId = localStorage.getItem("rideId");

      if (userId) {
        socket.emit("register_rider", { userId });
        console.log("Registered rider in ETA page, user ID:", userId);

        // Let the server know we're in the ETA phase with specific driver and request
        if (driverId && requestId) {
          socket.emit("tracking_driver", { driverId, requestId });
          console.log("Tracking driver:", driverId, "for request:", requestId);
        }
      }

      // Fetch driver info based on driverId in localStorage
      if (driverId) {
        // This would be replaced with an actual API call in production
        fetch(`http://localhost:5000/api/rides/details/passenger/${rideId}`, {
          credentials: "include",
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch driver info");
          })
          .then((data) => {
            setRideInfo(data);
            console.log("Fetched driver info:", data);
          })
          .catch((err) => {
            console.error("Error fetching driver info:", err);
            // Fallback to dummy data
            setDriverInfo({
              name: "John Driver",
              phone: "+91 98765 43210",
              vehicle: "Swift Dzire",
              vehicleNumber: "KA-01-AB-1234",
            });
          });
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error in ETA page:", error);
      toast.error("Connection issue - retrying...");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected to ETA page after ${attemptNumber} attempts`);

      // Re-register when reconnected
      const userId = localStorage.getItem("userId");
      const driverId = localStorage.getItem("driverId");
      const requestId = localStorage.getItem("requestId");

      if (userId) {
        socket.emit("register_rider", { userId });
        if (driverId && requestId) {
          socket.emit("tracking_driver", { driverId, requestId });
        }
      }
    });

    // Listen for driver location updates
    socket.on("driver_location_update", (location) => {
      console.log("Driver location update in ETA:", location);
      if (location.lat && location.lng) {
        setDriverLocation(location);
        localStorage.setItem("driverLocation", JSON.stringify(location));
      }
    });

    // Listen for driver arrival notification
    socket.on("driver_arrived", (data) => {
      console.log("Driver has arrived notification received:", data);

      // Store relevant data
      if (data.requestId) {
        localStorage.setItem("activeRequestId", data.requestId);
      }

      // Show toast notification
      toast.success("Your driver has arrived at the pickup location!", {
        description: "You will be redirected to the ride page shortly.",
      });

      // Redirect to ride page
      if (data.shouldRedirect) {
        setTimeout(() => {
          router.push("/ride");
        }, 2000); // Give user 2 seconds to see the toast before redirecting
      }
    });

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  // Calculate ETA display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 300) * 100; // 5 minutes max

  // Handler for ride completion
  const handleRideStarted = () => {
    toast.success("Your ride has started!");
    router.push("/ride");
  };

  // Handler for calling driver
  const handleCallDriver = () => {
    if (rideInfo && rideInfo.user.phone_no) {
      // In a real app, this would trigger a call
      toast.info(`Calling driver: ${rideInfo.user.phone_no}`);
    } else {
      toast.error("Driver contact information not available");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Driver details card */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h1 className="text-2xl font-bold mb-3">Your driver is on the way</h1>

          {rideInfo && (
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{rideInfo.user.name}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Car size={16} />
                  <span>
                    {rideInfo.vehicle.model} • {rideInfo.vehicle.vehicle_no}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCallDriver}
                className="ml-auto p-3 bg-green-500 text-white rounded-full"
              >
                <Phone size={20} />
              </button>
              <h2 className="text-lg font-semibold">
                {rideInfo.user.phone_no}
              </h2>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-blue-500" />
            <span className="font-medium">
              Arriving in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 w-full">
        {isClient && driverLocation && customIcon && (
          <MapContainer
            center={[driverLocation.lat, driverLocation.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%", minHeight: "400px" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {driverLocation && customIcon && (
              <Marker
                position={[driverLocation.lat, driverLocation.lng]}
                icon={customIcon}
              >
                <Popup>Driver's Location</Popup>
              </Marker>
            )}

            {pickupLocation && pickupIcon && (
              <Marker
                position={[pickupLocation.lat, pickupLocation.lng]}
                icon={pickupIcon}
              >
                <Popup>Pickup Location</Popup>
              </Marker>
            )}

            <MapUpdater coords={driverLocation} />
          </MapContainer>
        )}
      </div>

      {/* Bottom action button */}
      <div className="bg-white p-4 shadow-md">
        <button
          onClick={handleRideStarted}
          className="w-full py-3 bg-black text-white font-medium rounded-lg"
        >
          I've Met My Driver
        </button>
      </div>
    </div>
  );
}

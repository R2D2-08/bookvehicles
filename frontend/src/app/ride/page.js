"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import io from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FaCar,
  FaRoute,
  FaMapMarker,
  FaArrowUp,
  FaShieldAlt,
  FaPhone,
  FaCommentDots,
  FaExclamationTriangle,
  FaStar,
  FaUser,
  FaMapMarkerAlt,
  FaClock
} from "react-icons/fa";
import { GiSteeringWheel } from "react-icons/gi";

export default function RidePage() {
  const router = useRouter();
  const socketRef = useRef(null);
  const [journeyStarted, setJourneyStarted] = useState(true);
  const [journeyTimeLeft, setJourneyTimeLeft] = useState(600); // 10 minutes by default

  // Set up socket connection
  useEffect(() => {
    // Set up socket connection
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server in ride page");

      // Re-register as a rider when connected
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("register_rider", { userId });
        console.log("Registered rider in ride page, user ID:", userId);
      }
    });

    // Listen for journey ended notification
    socket.on("journey_ended", (data) => {
      console.log("Journey ended notification received:", data);

      // Show toast notification
      toast.success("Your journey has ended!", {
        description: `Fare: $${
          data.fare || "10.00"
        }. You will be redirected to the payment page.`,
      });

      // Redirect to payment page
      if (data.shouldRedirect && data.redirectTo) {
        setTimeout(() => {
          router.push(data.redirectTo);
        }, 2000); // Give user 2 seconds to see the toast before redirecting
      } else {
        setTimeout(() => {
          router.push("/pay");
        }, 2000);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [router]);

  // Countdown timer
  useEffect(() => {
    const journeyInterval = setInterval(() => {
      setJourneyTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(journeyInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(journeyInterval);
  }, []);

  const journeyProgress = ((600 - journeyTimeLeft) / 600) * 100;

  const rideDetails = {
    pickup: "Current Location",
    destination: "Destination Address",
    driverName: "John Driver",
    vehicle: "Ferrari R-800",
    licenseNumber: "ABC-1234"
    // Add other required properties
  };

  const position = [40.7128, -74.0060];

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds} min`;
  };

  if (journeyTimeLeft === 0) {
    router.push("/pay");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Map Section (60% width) */}
      <div className="w-full md:w-3/5 h-full">
        <MapContainer
          center={position}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>
              Your Driver is Here
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Ride Details Panel (40% width) */}
      <div className="w-full md:w-2/5 h-full bg-white p-6 shadow-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Active Ride
            </h1>
            <p className="text-gray-600">Tracking your journey in real-time</p>
          </div>

          {/* Driver Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUser className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{rideDetails.driverName}</h3>
                <p className="text-gray-600">Platinum-rated driver</p>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                Route Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <p className="font-medium">{rideDetails.pickup}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <p className="font-medium">{rideDetails.destination}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCar className="text-purple-500" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium">{rideDetails.vehicle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License</p>
                  <p className="font-medium">{rideDetails.license}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
            <div className="text-center mb-4">
              <FaClock className="text-3xl mb-2 mx-auto" />
              <p className="text-sm">Estimated arrival in</p>
              <h2 className="text-4xl font-bold my-2">{rideDetails.eta}</h2>
              <p className="text-sm">{rideDetails.distance} remaining</p>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${journeyProgress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>{journeyProgress}% completed</span>
              <span>{rideDetails.distance} to go</span>
            </div>
          </div>

          {/* Safety Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>24/7 Safety Monitoring Active</p>
            <p>Emergency assistance available</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

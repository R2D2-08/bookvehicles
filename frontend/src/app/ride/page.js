"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import io from "socket.io-client";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
  <motion.div 
    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 blur-[100px] opacity-50"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 blur-[100px] opacity-50"></div>

    {/* Header Section */}
    <div className="text-center mb-8">
      <motion.div 
        className="inline-block mb-4"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <GiSteeringWheel className="text-4xl text-white" />
        </div>
      </motion.div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Enjoy Your Journey! 🌟
      </h1>
      <p className="text-lg text-gray-600">
        Relax while we navigate to your destination
      </p>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Progress Section */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Arriving in</p>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatTime(journeyTimeLeft)}
            </h2>
            <p className="text-sm text-gray-600">
              {Math.round(journeyProgress)}% completed
            </p>
          </div>
          
          <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
              initial={{ width: "0%" }}
              animate={{ width: `${journeyProgress}%` }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="absolute right-0 -top-1 w-3 h-5 bg-white rounded-full"
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
            <img 
              src="/driver-avatar.jpg" 
              alt="Driver" 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-semibold">Driver John</h3>
            <div className="flex items-center gap-1 text-yellow-400">
              <FaStar className="w-4 h-4" />
              <span>4.98 (1.2k rides)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle & Route Details */}
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCar className="text-blue-500" />
            Vehicle Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Model</p>
              <p className="font-medium">Ferrari R-800</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Color</p>
              <p className="font-medium">Rosso Corsa</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">License</p>
              <p className="font-medium">ABC-1234</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Capacity</p>
              <p className="font-medium">4 passengers</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaRoute className="text-purple-500" />
            Route Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaArrowUp className="text-green-500" />
              </div>
              <p className="font-medium">{rideDetails.pickup}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <FaMapMarker className="text-red-500" />
              </div>
              <p className="font-medium">{rideDetails.destination}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Safety & Contact Footer */}
    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 text-gray-600 mb-4 sm:mb-0">
        <FaShieldAlt className="text-green-500" />
        <span className="text-sm">24/7 Safety Monitoring Active</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <FaPhone className="text-blue-500" />
        </button>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <FaCommentDots className="text-purple-500" />
        </button>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <FaExclamationTriangle className="text-red-500" />
        </button>
      </div>
    </div>
  </motion.div>
</div>
  );
}

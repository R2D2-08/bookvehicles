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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-4">
      <motion.div
        className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold mb-3">Enjoy Your Ride! 🚗</h1>
        <p className="text-gray-600 mb-6">
          Your driver is taking you to your destination
        </p>

        <div className="bg-white p-4 rounded-lg mb-6">
          <p className="text-lg font-medium mb-2">Estimated Time Remaining</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatTime(journeyTimeLeft)}
          </p>
        </div>

        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-blue-500 transition-all"
            initial={{ width: "0%" }}
            animate={{ width: `${journeyProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Your driver will notify you when you arrive at your destination.
          Payment will be processed automatically after your journey.
        </p>
      </motion.div>
    </div>
  );
}

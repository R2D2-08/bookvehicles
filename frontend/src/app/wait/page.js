"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { toast } from "sonner";

function WaitPage() {
  const [searching, setSearching] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const socketRef = useRef(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Set up socket connection for waiting for driver acceptance
    const socket = io("http://localhost:5000", { 
      withCredentials: true,
      transports: ['polling', 'websocket'], // Start with polling, then upgrade to websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    // Debug connection
    socket.on("connect", () => {
      console.log("Connected to socket server in wait page with ID:", socket.id);
      
      // Re-register as a rider when connected
      if (localStorage.getItem("userId")) {
        socket.emit("register_rider", { userId: localStorage.getItem("userId") });
        socket.emit("reconnect_rider"); // Tell server we're waiting for a ride
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error in wait page:", error);
      toast.error("Connection issue - retrying...");
    });
    
    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected to wait page server after ${attemptNumber} attempts`);
      // Re-register when reconnected
      if (localStorage.getItem("userId")) {
        socket.emit("register_rider", { userId: localStorage.getItem("userId") });
        socket.emit("reconnect_rider"); // Tell server we're waiting for a ride
      }
    });

    // Listen for ride acceptance
    socket.on("ride_accepted", (data) => {
      console.log("Ride accepted in wait page:", data);
      
      // Store driver information
      if (data.driverId) {
        localStorage.setItem("driverId", data.driverId);
        localStorage.setItem("requestId", data.requestId);
        
        setSearching(false);
        toast.success("Driver found! Redirecting to tracking page...");
        
        // Navigate to the ETA page with a slight delay for better UX
        setTimeout(() => {
          router.push("/eta");
        }, 1500);
      }
    });

    // Create progress bar animation
    const duration = 180000; // 3 minutes timeout
    const interval = 100; // Update every 100ms
    const step = (100 * interval) / duration;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(progressInterval);
          setSearching(false);
          setTimeoutReached(true);
          toast.error("No drivers available at the moment");
          return 100;
        }
        return prev + step;
      });
    }, interval);

    // Clean up on component unmount
    return () => {
      clearInterval(progressInterval);
      socket.disconnect();
    };
  }, [router]);

  // Handle timeout - allow user to retry or go back
  const handleRetry = () => {
    router.push("/select");
  };

  const handleBack = () => {
    router.push("/booking");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center p-8 bg-white shadow-2xl rounded-2xl max-w-md w-full">
        {searching ? (
          <>
            <h1 className="text-3xl font-bold mb-3">Searching for a Driver...</h1>
            <p className="font-light text-gray-500 mb-6 text-center">
              Hang tight! We're looking for available drivers near you.
            </p>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few minutes depending on driver availability.
            </p>
          </>
        ) : timeoutReached ? (
          <div className="text-center">
            <p className="text-xl font-bold text-red-500 mb-4">No Drivers Available</p>
            <p className="text-gray-600 mb-6">
              We couldn't find any drivers nearby. You can try again or modify your request.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleBack}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100 transition"
              >
                Go Back
              </button>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl font-bold text-green-500 mb-2">Driver Found!</p>
            <p className="text-gray-600 mb-4">Redirecting you to tracking page...</p>
            <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitPage;

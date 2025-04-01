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

  // Socket.io connection and event handlers
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
      if (localStorage.getItem("userId")) {
        socket.emit("register_rider", {
          userId: localStorage.getItem("userId"),
        });
        socket.emit("reconnect_rider");
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      toast.error("Connection issue - retrying...");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      if (localStorage.getItem("userId")) {
        socket.emit("register_rider", {
          userId: localStorage.getItem("userId"),
        });
        socket.emit("reconnect_rider");
      }
    });

    socket.on("ride_accepted", (data) => {
      console.log("Ride accepted:", data);
      if (data.driverId) {
        localStorage.setItem("driverId", data.driverId);
        localStorage.setItem("requestId", data.requestId);
        localStorage.setItem("rideId", data.rideId);
        setSearching(false);
        toast.success("Driver found! Redirecting...");
        setTimeout(() => router.push("/eta"), 1500);
      }
    });

    // Progress bar setup
    const duration = 180000;
    const interval = 100;
    const step = (100 * interval) / duration;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(progressInterval);
          setSearching(false);
          setTimeoutReached(true);
          toast.error("No drivers available");
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      clearInterval(progressInterval);
      socket.disconnect();
    };
  }, [router]);

  const handleRetry = () => router.push("/select");
  const handleBack = () => router.push("/booking");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center p-8 bg-white backdrop-blur-lg shadow-xl rounded-3xl max-w-md w-full mx-4">
        {searching ? (
          <>
            <h1 className="text-2xl font-semibold text-black mb-4 text-center">
              Matching You with the Perfect Driver
            </h1>
            <p className="text-slate-400 text-center mb-6 text-sm">
              Scanning nearby drivers • {Math.round(progress)}% complete
            </p>

            <div className="w-full h-2.5 bg-slate-700 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="w-full h-full animate-pulse bg-white/10"></div>
              </div>
            </div>

            <div className="flex space-x-2 justify-center mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 bg-black rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center">
              Average wait time: 2-4 minutes
            </p>
          </>
        ) : timeoutReached ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-100 mb-3">
              No Drivers Available
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              We&apos;re expanding our driver network. Please try again shortly.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleRetry}
                className="w-full py-3 px-6 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 transition-all duration-200"
              >
                ↻ Retry Search
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 px-6 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 transition-all duration-200"
              >
                ← Adjust Request
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 animate-scale-in">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-500 rounded-full">
                  <svg
                    className="w-8 h-8 text-white animate-check"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-100 mb-3">
              Driver Matched!
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Preparing your ride details...
            </p>

            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="w-full h-full bg-cyan-500 animate-progress"></div>
              </div>
              <p className="text-xs text-slate-500">
                Redirecting to tracking...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitPage;

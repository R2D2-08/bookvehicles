"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function ETA() {
  const [searching, setSearching] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const duration = 180000; // 3 minutes in milliseconds
    const interval = 100; // Update every 100ms
    const step = (100 * interval) / duration; // Calculate progress step

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(progressInterval);
          setSearching(false);
          router.push("/eta/live-location"); // Navigate to live location page
          return 100;
        }
        return prev + step;
      });
    }, interval);

    // Simulate receiving driver's location early
    const fetchDriverLocation = () => {
      fetch("/api/getDriverLocation") // Example API call
        .then((res) => res.json())
        .then((data) => {
          if (data.found) {
            clearInterval(progressInterval);
            setSearching(false);
            router.push("/eta/live-location"); // Navigate when driver is found
          }
        })
        .catch((err) => console.error("Error fetching driver location:", err));
    };

    const checkLocation = setInterval(fetchDriverLocation, 5000); // Check every 5s

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkLocation);
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center p-8 bg-white shadow-2xl rounded-2xl">
        {searching ? (
          <>
            <h1 className="text-3xl font-bold mb-3">Searching for a Driver...</h1>
            <p className="font-light text-gray-400 mb-4">
              Hang tight! This might take a few moments.
            </p>
            <div className="w-72 h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        ) : (
          <p className="text-xl font-bold text-green-500">Driver Found! Redirecting...</p>
        )}
      </div>
    </div>
  );
}

export default ETA;

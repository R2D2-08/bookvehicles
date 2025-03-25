"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function LiveETA() {
  const totalTime = 180;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const intervalRef = useRef(null);

  const [rideDetails, setRideDetails] = useState({
    driverName: "John Doe",
    vehicle: "Toyota Prius - ABC1234",
    licenseNumber: "XYZ-9876",
    pickup: "123 Main St, City",
    destination: "456 Elm St, City",
    driverPhoto: "https://via.placeholder.com/120", // Increased size placeholder image
  });

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const progress = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-row items-center justify-center min-h-screen w-full p-6 space-x-6">
      {/* Left Column: Map - Increased Size */}
      <div className="flex-[1.5] bg-gray-200 flex items-center justify-center rounded-lg shadow-lg p-4 h-[90vh]">
        <p className="text-gray-600">Map goes here</p>
      </div>

      {/* Right Column: Ride Details and ETA */}
      <div className="flex-1 flex flex-col space-y-6 h-[90vh]">
        {/* Ride Details (Top Box) */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-8 flex flex-col space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Ride Details</h3>
          <div className="flex items-center space-x-6">
            <img
              src={rideDetails.driverPhoto}
              alt="Driver"
              className="w-32 h-32 rounded-full border-4 border-gray-300"
            />
            <div className="text-lg">
              <p className="text-gray-700 font-semibold">Driver: {rideDetails.driverName}</p>
              <p className="text-gray-700 font-semibold">Vehicle: {rideDetails.vehicle}</p>
              <p className="text-gray-700 font-semibold">License: {rideDetails.licenseNumber}</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 font-semibold">Pickup: {rideDetails.pickup}</p>
          <p className="text-lg text-gray-700 font-semibold">Destination: {rideDetails.destination}</p>
        </div>

        {/* ETA Countdown & Progress Bar (Bottom Box) */}
        <div className="h-[30%] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
          <p className="text-xl text-gray-600">ETA</p>
          <h2 className="text-4xl font-bold">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </h2>
          <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mt-4">
            <motion.div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            ></motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

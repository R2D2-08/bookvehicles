"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LiveETA() {
  const router = useRouter();
  const arrivalTime = 180;
  const journeyTime = 10;

  const [timeLeft, setTimeLeft] = useState(arrivalTime);
  const [journeyStarted, setJourneyStarted] = useState(true);
  const [journeyTimeLeft, setJourneyTimeLeft] = useState(journeyTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setJourneyStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (journeyStarted) {
      const journeyInterval = setInterval(() => {
        setJourneyTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(journeyInterval);
            router.push("/pay");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(journeyInterval);
    }
  }, [journeyStarted, router]);

  const progress = ((arrivalTime - timeLeft) / arrivalTime) * 100;
  const journeyProgress = ((journeyTime - journeyTimeLeft) / journeyTime) * 100;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds} min`;
  };

  if (journeyStarted && journeyTimeLeft === 0) {
    return null;
  }

  if (journeyStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
        <motion.div
          className="bg-gray-100 p-6 rounded-lg shadow-lg w-80 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-semibold mb-3">Enjoy Your Ride! 🚗</h1>
          <p className="text-gray-600 mb-4">ETA to Destination: {formatTime(journeyTimeLeft)}</p>
          <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 transition-all"
              initial={{ width: "0%" }}
              animate={{ width: `${journeyProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <motion.div
        className="bg-gray-100 p-6 rounded-lg shadow-lg w-80 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-semibold mb-3">Searching for a Driver...</h1>
        <p className="text-gray-600 mb-4">ETA: {formatTime(timeLeft)}</p>
        <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500 transition-all"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

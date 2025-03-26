"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaCar, 
  FaShieldAlt,
  FaComments,
  FaPhoneAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import { GiSteeringWheel } from "react-icons/gi";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-50">
  <motion.div 
    className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Header Section */}
    <div className="text-center mb-8">
      <motion.div 
        className="inline-block mb-4"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <GiSteeringWheel className="text-4xl text-white" />
        </div>
      </motion.div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Enjoy Your Journey! 🚗
      </h1>
      <p className="text-lg text-gray-600">
        Your destination is getting closer!
      </p>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Map Section */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
          <FaMapMarkerAlt className="text-4xl text-purple-600 animate-pulse" />
          <div className="absolute w-24 h-24 border-4 border-blue-500 rounded-full" />
          <div className="absolute w-12 h-12 bg-purple-500 rounded-full shadow-lg" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-6">
        {/* Driver Info */}
        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
            <Image 
              src="/avatar-placeholder.jpg" 
              alt="Driver" 
              width={64} 
              height={64} 
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Driver John</h3>
            <p className="text-gray-600 text-sm">Platinum-rated driver</p>
            <div className="flex items-center gap-1 text-yellow-400">
              <FaStar />
              <span>4.98 (1.2k rides)</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Completed</span>
            <span>{Math.round(journeyProgress)}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: `${journeyProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="text-center text-2xl font-bold text-gray-800">
            {formatTime(journeyTimeLeft)} remaining
          </div>
        </div>
      </div>
    </div>

    {/* Vehicle & Safety */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <FaCar className="text-2xl text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold">Ferrari R-800</h3>
          <p className="text-gray-600 text-sm">ABC-1234 • Red Sedan</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-lg">
          <FaShieldAlt className="text-2xl text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold">Safety First</h3>
          <p className="text-gray-600 text-sm">24/7 Emergency Support</p>
        </div>
      </div>
    </div>

    {/* Contact Options */}
    <div className="mt-8 flex justify-center gap-4">
      <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition">
        <FaComments className="text-2xl" />
      </button>
      <button className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition">
        <FaPhoneAlt className="text-2xl" />
      </button>
      <button className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
        <FaExclamationTriangle className="text-2xl" />
      </button>
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

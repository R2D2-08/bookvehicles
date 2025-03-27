"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  Car,
  IdCard,
  MapPin,
  ArrowUp,
  ShieldCheck,
  Phone,
  MessageCircle,
  AlertTriangle
} from "lucide-react";

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
    <div className="flex h-screen bg-gray-50">
  {/* Map Container (75% width) */}
  <div className="w-3/4 h-full">
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      className="h-full w-full rounded-r-2xl shadow-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          Your Driver is Here
        </Popup>
      </Marker>
    </MapContainer>
  </div>

  {/* Ride Details Sidebar (25% width) */}
  <div className="w-1/4 h-full flex flex-col p-6 space-y-6 bg-white shadow-xl">
    {/* Driver Profile Section */}
    <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
      <div className="relative">
        <img
          src={rideDetails.driverPhoto}
          alt="Driver"
          className="w-16 h-16 rounded-full border-4 border-white shadow-md"
        />
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          ⭐ {rideDetails.rating}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{rideDetails.driverName}</h3>
        <p className="text-sm text-gray-600">{rideDetails.vehicle}</p>
      </div>
    </div>

    {/* Route Details */}
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="pt-1">
          <span className="w-4 h-4 bg-green-500 rounded-full block"></span>
        </div>
        <div>
          <p className="text-xs text-gray-500">PICKUP LOCATION</p>
          <p className="font-medium">{rideDetails.pickup}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="pt-1">
          <span className="w-4 h-4 bg-red-500 rounded-full block"></span>
        </div>
        <div>
          <p className="text-xs text-gray-500">DESTINATION</p>
          <p className="font-medium">{rideDetails.destination}</p>
        </div>
      </div>
    </div>

    {/* ETA Progress */}
    <div className="mt-auto bg-blue-50 rounded-xl p-5 space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Arriving in</p>
        <div className="text-3xl font-bold text-blue-600">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(progress)}% completed</span>
          <span>{Math.round(progress)} km left</span>
        </div>
      </div>
    </div>

    {/* Safety Controls */}
    <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
        <Phone className="w-5 h-5 text-blue-600" />
      </button>
      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
        <MessageCircle className="w-5 h-5 text-green-600" />
      </button>
      <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
        <AlertTriangle className="w-5 h-5 text-red-600" />
      </button>
    </div>
  </div>
</div>
  );
}

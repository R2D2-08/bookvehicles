"use client";
import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import UserProfile from "../profile/page.js";
import Image from "next/image";
import "leaflet/dist/leaflet.css";
import {
  Car,
  User,
  ToggleLeft,
  ToggleRight,
  Bell,
  MapPin,
  Phone,
  UserCircle,
  XCircle,
  CheckCircle
} from "lucide-react";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css"; // Import Leaflet styles globally

// Dynamically import components from react-leaflet (for client-side rendering)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const CarIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
    />
  </svg>
);

const LicensePlateIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
    />
  </svg>
);

const PaintBucketIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
    />
  </svg>
);

const UserGroupIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
);

const DriverDashboard = () => {
  const [isClient, setIsClient] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [socket, setSocket] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);
  useEffect(() => {
    setIsClient(true);
    fetch("http://localhost:5000/api/users/id", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setDriverId(data.id);
      })
      .catch((err) => console.error("Error fetching driver ID:", err));
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("driver_register", { driverId });
    });

    const handleNewRideRequest = ({ requestId, data }) => {
      console.log(`New ride request ${requestId}`);
      setRideRequests((prev) => [
        ...prev,
        {
          id: requestId,
          name: "randomUser",
          phone: "456",
          pickup: data.pickLoc,
          dropoff: data.dropLoc,
          fare: data.price,
          time: `${Math.floor(
            (Date.now() - data.booking_date) / 60000
          )} mins ago`,
        },
      ]);
    };

    socket.on("new_ride_request", handleNewRideRequest);

    return () => {
      socket.off("new_ride_request", handleNewRideRequest);
      socket.disconnect();
    };
  }, [driverId]);

  useEffect(() => {
    if (!driverId || !socketRef.current) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            socketRef.current.emit("driver_location", {
              driverId,
              lat: latitude,
              lng: longitude,
            });
            console.log(`Location updated: ${latitude}, ${longitude}`);
          },
          (error) => console.error("Error getting location:", error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    };

    locationIntervalRef.current = setInterval(sendLocation, 5000);

    return () => clearInterval(locationIntervalRef.current);
  }, [driverId]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeRide, setActiveRide] = useState(null);

  let locationInterval;

  const handleAccept = (id) => {
    if (!socketRef.current) {
      console.error("Socket not initialized yet.");
      return;
    }

    const acceptedRide = rideRequests.find((req) => req.id === id);
    if (acceptedRide) {
      setActiveRide(acceptedRide);
      setRideRequests([]);

      socketRef.current.emit("accept_ride", {
        driverId,
        requestId: acceptedRide.id,
        pickup: acceptedRide.pickup,
        dropoff: acceptedRide.dropoff,
      });
    }
  };

  const handleReject = (id) => {
    setRideRequests(rideRequests.filter((request) => request.id !== id));
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const [rideOngoing, setRideOngoing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const notifyPassenger = () => {
    setRideOngoing(true);
  };

  const endJourney = () => {
    setShowReviewModal(true);
  };

  const submitReview = () => {
    setShowReviewModal(false);
    setActiveRide(null);
    setRideOngoing(false);
    setActiveTab("notifications");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/5 bg-white shadow-xl p-6 flex flex-col gap-6 items-center border-r">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
            activeTab === "profile"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={22} /> Profile
        </button>
        <button
          className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
            activeTab === "car"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("car")}
        >
          <Car size={22} /> View Car
        </button>
        <button
          className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
            isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
          onClick={toggleAvailability}
        >
          {isAvailable ? <ToggleLeft size={22} /> : <ToggleRight size={22} />}
          {isAvailable ? "Available" : "Offline"}
        </button>
        <button
          className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
            activeTab === "notifications"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell size={22} /> Ride Requests
        </button>
      </div>

      <div className="flex-1 p-8">
        {activeTab === "profile" && <UserProfile />}

        {activeTab === "car" && (
        
  <div className="flex flex-col lg:flex-row justify-center items-center h-full gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Image Section with Hover Effect */}
    <div className="flex-1 flex justify-center max-w-2xl transform transition-transform duration-500 hover:scale-105">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
        <Image
          src="/images/car.webp"
          alt="Driver's Car"
          width={800}
          height={500}
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
          PREMIUM CLASS
        </div>
      </div>
    </div>

    {/* Details Section */}
    <div className="flex-1 max-w-xl bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl border border-gray-100">
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 border-l-4 border-red-600 pl-4">
          Vehicle Details
        </h2>
        
        <div className="space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Ferrari R-800
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CarIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-800">Sedan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LicensePlateIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">License Plate</p>
                <p className="font-medium text-gray-800">ABC-1234</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <PaintBucketIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-medium text-gray-800">Rosso Corsa</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <p className="font-medium text-gray-800">4 Available</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-gray-700 italic">
              ★★★★★ (4.9/5.0 Rating)<br />
              "Impeccably maintained with premium leather interior, dual-zone climate control, 
              and advanced safety features. Experience luxury performance at its finest."
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === "notifications" && !activeRide && (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Ride Requests</h2>
        <p className="text-gray-500 text-sm mt-1">Recent ride requests from passengers</p>
      </div>
      
      {rideRequests.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {rideRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Location Details */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{request.pickup}</p>
                      <p className="text-sm text-gray-500">to {request.dropoff}</p>
                    </div>
                  </div>
                </div>

                {/* Fare & Time */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Fare</p>
                  <p className="font-medium text-green-600">${request.fare}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="text-sm font-medium text-gray-800">{request.time}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No requests available</h3>
            <p className="mt-1 text-sm text-gray-500">New ride requests will appear here automatically</p>
          </div>
        </div>
      )}
    </div>
  </div>
)}

        {/* Ride in Progress */}
        {activeTab === "notifications" && activeRide && (
          <div className="flex flex-col items-center mt-10 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Active Ride
            </h2>

            <div className="flex justify-center items-start gap-6 w-3/4">
              {/* Passenger Details Box */}
              <div className="bg-white shadow-lg p-6 rounded-xl w-1/2 h-80 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Passenger Details
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <UserCircle size={40} className="text-blue-500" />
                  <p className="text-xl font-semibold">{activeRide.name}</p>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <Phone size={30} className="text-green-500" />
                  <p className="text-lg text-gray-700">{activeRide.phone}</p>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <MapPin size={30} className="text-red-500" />
                  <p className="text-lg text-gray-700">
                    <strong>Pickup:</strong> {activeRide.pickup}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin size={30} className="text-purple-500" />
                  <p className="text-lg text-gray-700">
                    <strong>Drop-off:</strong> {activeRide.dropoff}
                  </p>
                </div>
              </div>

              {/* Map Box */}
              {isClient && !showReviewModal && (
                <div className="bg-gray-200 shadow-lg rounded-xl w-1/2 h-80">
                  <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[51.505, -0.09]}>
                      <Popup>A simple popup</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}
            </div>
            {/* Notify Passenger Button */}
            <div className="mt-6 flex justify-center w-full">
              <button
                className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-500 transition"
                onClick={rideOngoing ? endJourney : notifyPassenger}
              >
                {rideOngoing ? "End Journey" : "Notify Passenger of Arrival"}
              </button>
            </div>

            {/* Rating & Review Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
                  {/* Close Button at Top Right */}
                  <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
                    onClick={() => setShowReviewModal(false)}
                  >
                    ✖
                  </button>

                  <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                    Rate the Passenger
                  </h2>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-3xl transition ${
                          rating >= star
                            ? "text-yellow-500"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {/* Review Text Area */}
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none transition"
                    placeholder="Write a review..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  ></textarea>

                  {/* Buttons */}
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      onClick={() => setShowReviewModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      onClick={submitReview}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;

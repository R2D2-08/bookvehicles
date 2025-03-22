"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { io } from "socket.io-client";

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

const DriverDashboard = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    setIsClient(true);
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("driver_register");
    });

    const handleNewRideRequest = ({ requestId, data }) => {
      console.log(`New ride request ${requestId}`);
      setRideRequests(rideRequests => [...rideRequests, {
        id: 4,
        name: "randomUser",
        phone: "456",
        pickup: data.pickLoc,
        dropoff: data.dropLoc,
        fare: data.price,
        time: `${Math.floor((Date.now() - data.booking_date)/60)} mins ago`
      }])
    };

    socket.on("new_ride_request", handleNewRideRequest);


    return () => {
      socket.off("new_ride_request", handleNewRideRequest);
      socket.disconnect();
    };
  }, []);
  const [activeTab, setActiveTab] = useState("profile");
  const [isAvailable, setIsAvailable] = useState(true);
  const [rideRequests, setRideRequests] = useState([
    {
      id: 1,
      name: "John Doe",
      phone: "+123456789",
      pickup: [40.7128, -74.006],
      dropoff: "Airport",
      fare: "$25",
      time: "2 mins ago",
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "+987654321",
      pickup: [40.758, -73.9855],
      dropoff: "Train Station",
      fare: "$15",
      time: "5 mins ago",
    },
  ]);
  const [activeRide, setActiveRide] = useState(null);

  let locationInterval;

  const handleAccept = (id) => {
    const acceptedRide = rideRequests.find((req) => req.id === id);
  
    if (acceptedRide) {
      setActiveRide(acceptedRide);
      setRideRequests([]);
  
      // Emit ride acceptance
      socket.emit("rideAccepted", {
        driverId: driver.id, // Ensure you have the driver ID
        rideId: acceptedRide.id,
        pickupLocation: acceptedRide.pickupLocation,
        dropoffLocation: acceptedRide.dropoffLocation,
      });
  
      // Start sending live location
      locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("driverLocation", {
              driverId: driver.id,
              rideId: acceptedRide.id,
              latitude,
              longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }, 5000); // Send location every 5 seconds
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
          <div className="flex flex-col justify-center items-center h-full">
            <Image
              src="/images/car.webp"
              alt="Driver's Car"
              width={500}
              height={300}
              className="rounded-xl shadow-lg"
            />
            <p className="mt-4 text-lg text-gray-700 text-center max-w-md font-semibold">
              The Ferrari R-800 is an amazing addition to the collection of cars
              you would want to transit in.
            </p>
          </div>
        )}

        {activeTab === "notifications" && !activeRide && (
          <div className="flex flex-col gap-4 p-6 bg-white shadow-md rounded-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Ride Requests</h2>
            {rideRequests.length > 0 ? (
              rideRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-gray-100 rounded-xl shadow flex flex-col gap-2"
                >
                  <p className="text-gray-800 font-semibold">
                    <strong>Pickup:</strong> {request.pickup} {" "}
                    <strong>Drop-off:</strong> {request.dropoff}
                  </p>
                  <p className="text-gray-600 font-medium">
                    Fare: {request.fare}
                  </p>
                  <span className="text-sm text-gray-500">{request.time}</span>
                  <div className="flex gap-3">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg w-full font-semibold transition-all hover:bg-green-600"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg w-full font-semibold transition-all hover:bg-red-600"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-lg font-semibold text-center">
                No new ride requests.
              </p>
            )}
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

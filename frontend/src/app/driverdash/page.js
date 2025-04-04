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
  CheckCircle,
  Edit,
  BadgeCheck,
  Star,
  Mail,
  ClipboardList,
  StarIcon,
} from "lucide-react";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css"; // Import Leaflet styles globally
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("profile");
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeRide, setActiveRide] = useState(null);
  const [rideOngoing, setRideOngoing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [rideId, setRideId] = useState(null);
  const [revieweeId, setRevieweeId] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const locationErrorCount = useRef(0);

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
    const fetchRideDetails = async () => {
      try {
        const userId = localStorage.getItem("userId") || 2;
        if (!userId) {
          console.error("User not logged in.");
          return;
        }
        console.log(userId);
        setRideId(15);
        const driverId = localStorage.getItem("driverId") || 1;
        setRevieweeId(driverId);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      }
    };

    const fetchDriverDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const res = await response.json();

        if (!response.ok) {
          toast.error("Failed to fetch driver details");
          return;
        }
        setDriverDetails(res);
        console.log(res);
      } catch (err) {
        toast.error("Internal Server Error");
      }
    };
    fetchDriverDetails();
    fetchRideDetails();
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["polling", "websocket"], // Start with polling first, then upgrade to websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server with socket ID:", socket.id);
      // Register with driverId
      socket.emit("driver_register", { driverId });

      // Check for active ride in localStorage
      const savedActiveRide = localStorage.getItem("activeRide");
      if (savedActiveRide) {
        try {
          // If we have an active ride stored, try to reconnect to it
          const parsedRide = JSON.parse(savedActiveRide);
          console.log("Found saved active ride:", parsedRide.id);
          socket.emit("reconnect_driver", { driverId });
        } catch (e) {
          console.error("Error parsing saved active ride:", e);
          localStorage.removeItem("activeRide");
        }
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection issue - retrying...");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      // Re-register with driverId on reconnect
      socket.emit("driver_register", { driverId });

      // Also try to reconnect to any active ride
      socket.emit("reconnect_driver", { driverId });
    });

    // Handle ride status updates (new handler)
    socket.on("ride_status", (rideData) => {
      console.log("Received ride status update:", rideData);
      if (rideData.status === "accepted") {
        // Restore active ride
        setActiveRide({
          id: rideData.requestId,
          name: "Passenger", // Use default name if real name not available
          phone: "Contact through app", // Use default phone if not available
          pickup: rideData.pickup,
          dropoff: rideData.dropoff,
        });

        toast.info("Reconnected to your active ride!");
      }
    });

    const handleNewRideRequest = ({ requestId, data }) => {
      console.log(`New ride request ${requestId}`);
      const myDate = new Date(data.booking_date);
      const result = myDate.getTime();
      console.log(result);
      console.log(Date.now());
      setRideRequests((prev) => [
        ...prev,
        {
          id: requestId,
          name: "randomUser",
          phone: "456",
          pickup: data.pickLoc,
          dropoff: data.dropLoc,
          fare: data.price,
          time: `${Math.floor((Date.now() - result) / 60000)} mins ago`,
        },
      ]);
    };

    socket.on("new_ride_request", handleNewRideRequest);

    // Add handler for ride_taken event to remove requests taken by other drivers
    socket.on("ride_taken", (requestId) => {
      console.log(`Ride ${requestId} taken by another driver`);
      setRideRequests((prev) => prev.filter((req) => req.id !== requestId));
    });

    return () => {
      socket.off("new_ride_request", handleNewRideRequest);
      socket.off("ride_taken");
      socket.off("ride_status");
      socket.disconnect();
    };
  }, [driverId]);

  useEffect(() => {
    if (!driverId || !socketRef.current) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            // Reset error counter on successful location
            locationErrorCount.current = 0;
            if (locationError) setLocationError(false);

            const { latitude, longitude } = coords;

            // Standardize location format to lat/lng
            const locationData = {
              lat: latitude,
              lng: longitude,
            };

            // Send update_location event
            socketRef.current.emit("update_location", locationData);

            // If this driver has an active ride, also send driver_location event
            if (activeRide) {
              socketRef.current.emit("driver_location", {
                driverId,
                ...locationData,
              });
            }

            console.log(`Location updated: ${latitude}, ${longitude}`);
          },
          (error) => {
            // Improved error handling with error code information
            const errorMessages = {
              1: "Permission denied. Please enable location access.",
              2: "Position unavailable. GPS signal may be weak.",
              3: "Location request timed out.",
            };

            const errorMessage =
              errorMessages[error.code] || "Unknown error getting location";
            console.error(
              `Geolocation error (${error.code}): ${errorMessage}`,
              error
            );

            // Track consecutive errors
            locationErrorCount.current += 1;

            // If we've had multiple consecutive errors, show a warning
            if (locationErrorCount.current >= 3 && !locationError) {
              setLocationError(true);
              toast.error(
                "Having trouble accessing your location. Please ensure location services are enabled.",
                { duration: 6000 }
              );
            }

            // We'll still continue trying in the next interval
          },
          {
            enableHighAccuracy: false,
            timeout: 600000, // Increased timeout (10s instead of 5s)
            maximumAge: 30000, // Allow using a cached position up to 30 seconds old
          }
        );
      }
    };

    // Clear any existing interval to prevent duplicates
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    // Set up new interval
    locationIntervalRef.current = setInterval(sendLocation, 5000);

    // Run once immediately to get initial position
    sendLocation();

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [driverId, activeRide]);

  let locationInterval;

  const handleAccept = (id) => {
    if (!socketRef.current) {
      console.error("Socket not initialized yet.");
      return;
    }

    if (!driverId) {
      console.error("Driver ID not available.");
      toast.error("Cannot accept ride: Driver ID not available");
      return;
    }

    console.log(`Accepting ride request ${id} as driver ${driverId}`);

    // Find the ride in our requests array
    const acceptedRide = rideRequests.find((req) => req.id === id);
    if (acceptedRide) {
      // Update UI state
      setActiveRide(acceptedRide);
      setRideRequests(rideRequests.filter((req) => req.id !== id));

      // Send the accept_ride event to the server
      socketRef.current.emit("accept_ride", {
        driverId: driverId,
        requestId: id,
      });

      console.log(`Sent accept_ride event to server for request ${id}`);

      // Keep the activeTab as "notifications" since that's where active rides are displayed

      toast.success("Ride accepted! Waiting for passenger...");

      // Store in localStorage for persistence
      localStorage.setItem("activeRideId", id);
      localStorage.setItem("activeRide", JSON.stringify(acceptedRide));

      // Immediately start sending location updates for this ride
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            socketRef.current.emit("driver_location", {
              driverId: driverId,
              lat: latitude,
              lng: longitude,
            });
            console.log(`Sent initial location update for accepted ride ${id}`);
          },
          (error) => {
            // Improved error handling with error code information
            const errorMessages = {
              1: "Permission denied. Please enable location access.",
              2: "Position unavailable. GPS signal may be weak.",
              3: "Location request timed out.",
            };

            const errorMessage =
              errorMessages[error.code] || "Unknown error getting location";
            console.error(
              `Geolocation error (${error.code}): ${errorMessage}`,
              error
            );

            // The ride is still accepted, we just couldn't get the initial location
            toast.warning(
              "Could not send initial location. Make sure location access is enabled."
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
          }
        );
      }
    }
  };

  const handleReject = (id) => {
    setRideRequests(rideRequests.filter((request) => request.id !== id));
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const notifyPassenger = () => {
    if (!socketRef.current || !activeRide || !driverId) {
      console.error(
        "Cannot notify passenger: missing socket, ride details, or driver ID"
      );
      toast.error("Cannot notify passenger. Please try again.");
      return;
    }

    console.log(`Notifying passenger for ride ${activeRide.id}`);

    // Emit the driver_arrived event to the server with detailed logs
    try {
      socketRef.current.emit("driver_arrived", {
        requestId: activeRide.id,
        driverId: driverId,
        redirectPassenger: true, // Add this flag to explicitly request passenger redirection
      });
      console.log(
        `Successfully emitted driver_arrived event for ride ${activeRide.id}`
      );

      // Update local state
      setRideOngoing(true);
      toast.success(
        "Passenger has been notified of your arrival and will be redirected to the ride page!"
      );
    } catch (error) {
      console.error("Error sending driver_arrived event:", error);
      toast.error("Failed to notify passenger. Please try again.");
    }
  };

  const endJourney = () => {
    if (!socketRef.current || !activeRide || !driverId) {
      console.error(
        "Cannot end journey: missing socket, ride details, or driver ID"
      );
      toast.error("Cannot end journey. Please try again.");
      return;
    }

    console.log(`Ending journey for ride ${activeRide.id}`);

    // Emit the end_journey event to the server with detailed logs
    try {
      socketRef.current.emit("end_journey", {
        requestId: activeRide.id,
        driverId: driverId,
      });
      console.log(
        `Successfully emitted end_journey event for ride ${activeRide.id}`
      );

      // Show review modal
      setShowReviewModal(true);
      toast.success(
        "Journey ended successfully! The passenger will be redirected to payment."
      );

      // Clean up local storage
      localStorage.removeItem("activeRide");
      localStorage.removeItem("activeRideId");
    } catch (error) {
      console.error("Error sending end_journey event:", error);
      toast.error("Failed to end journey. Please try again.");
    }
  };

  const submitReview = async () => {
    if (!rideId || !revieweeId || rating === 0 || review.trim() === "") {
      toast.info("Please provide a rating and review.");
      return;
    }

    const reviewerId = localStorage.getItem("userId") || 2;
    if (!reviewerId) {
      toast.error("User not logged in.");
      return;
    }

    const payload = {
      ride_id: rideId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      review_text: review,
      review_type: "driver",
    };
    console.log(payload);
    try {
      const response = await fetch("http://localhost:5000/api/users/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Review Submitted!");
      } else {
        const data = await response.json();
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong.");
    }
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
        {/* Location Error Warning Banner */}
        {locationError && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Location issues detected. Please ensure location services are
            enabled for accurate ride information.
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100">
              {/* Profile Header */}
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900">
                  Driver Profile
                </h2>
                <p className="text-gray-500 mt-1">
                  Manage your account information
                </p>
              </div>

              {/* Profile Content */}
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Profile Image */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                      <Image
                        src={
                          driverDetails?.user?.photo_url
                            ? `http://localhost:5000${driverDetails.user.photo_url}`
                            : "/images/avatar-placeholder.jpg"
                        }
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover hover:scale-105 transition-transform"
                        priority
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {driverDetails?.user?.name || "Driver"}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BadgeCheck className="w-5 h-5 text-green-500" />
                      <span>Verified Driver</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>4.9/5.0 Rating (127 trips)</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UserCircle className="w-6 h-6 text-blue-500" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">
                          {driverDetails?.user?.email || "driver@gmail.com"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">
                          {driverDetails?.user?.phone_no || "7909234578"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">Kozhikode, Kerala</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ClipboardList className="w-6 h-6 text-green-500" />
                      Driver Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium">
                          {driverDetails?.driver?.license_no || "D123-4567-890"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-medium">2025-12-31</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Years Driving</p>
                        <p className="font-medium">8 years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trips Completed</p>
                        <p className="font-medium">247</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Car className="w-6 h-6 text-red-500" />
                      Vehicle Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Make & Model</p>
                        <p className="font-medium">
                          {driverDetails?.vehicle?.model
                            ? driverDetails?.vehicle?.model.split(" ")[0]
                            : "Ferrari R-800"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Plate</p>
                        <p className="font-medium">
                          {driverDetails?.driver?.license_no || "ABC-1234"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Color</p>
                        <p className="font-medium">Rosso Corsa</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">
                          {driverDetails?.vehicle?.model
                            ? driverDetails?.vehicle?.model.split(" ")[1]
                            : "2009"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "car" && (
          <div className="flex flex-col lg:flex-row justify-center items-center h-full gap-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Image Section with Hover Effect */}
            <div className="flex-1 flex justify-center max-w-2xl transform transition-transform duration-500 hover:scale-105">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={
                    driverDetails?.vehicle?.image_url
                      ? `http://localhost:5000${driverDetails.vehicle.image_url}`
                      : "/images/car.webp"
                  }
                  alt="Driver's Car"
                  width={800}
                  height={500}
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {driverDetails?.vehicle?.type || "PREMIUM"}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 max-w-xl bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl border border-gray-200/80 hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 relative pl-5">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></span>
                      Vehicle Specifications
                    </h2>
                  </div>
                </div>

                {/* Vehicle Model */}
                <div className="relative group">
                  <h3 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {driverDetails?.vehicle?.model
                      ? driverDetails.vehicle.model.split(" ")[0]
                      : "Ferrari"}{" "}
                    <span className="text-red-600">
                      {driverDetails?.vehicle?.model
                        ? driverDetails.vehicle.model.split(" ")[1]
                        : "R-800"}
                    </span>
                  </h3>
                  <div className="absolute -bottom-1 left-0 h-1 w-24 bg-gradient-to-r from-red-600 to-orange-500 rounded-full opacity-80 group-hover:w-32 transition-all duration-300"></div>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <CarIcon className="w-6 h-6 text-red-600" />,
                      label: "Vehicle Type",
                      value: driverDetails?.vehicle?.type || "Luxury Sedan",
                      badge: "Executive",
                    },
                    {
                      icon: (
                        <LicensePlateIcon className="w-6 h-6 text-red-600" />
                      ),
                      label: "License Plate",
                      value: driverDetails?.driver?.license_no || "ABC-1234",
                      badge: "Valid",
                    },
                    {
                      icon: (
                        <PaintBucketIcon className="w-6 h-6 text-red-600" />
                      ),
                      label: "Exterior Color",
                      value: "Rosso Corsa",
                      badge: "Premium",
                    },
                    {
                      icon: <UserGroupIcon className="w-6 h-6 text-red-600" />,
                      label: "Seating Capacity",
                      value: "4 Passengers",
                      badge: "Comfort",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 hover:bg-gray-50/50 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-red-50 rounded-lg">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">
                            {item.value}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rating & Description */}
                <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100/50">
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < 4 ? "text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      4.9/5.0 (128 reviews)
                    </span>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    &quot;Impeccably maintained with premium Nappa leather
                    interior, carbon fiber accents, dual-zone climate control,
                    and advanced driver assistance systems. Experience the
                    pinnacle of Italian automotive craftsmanship.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && !activeRide && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  Ride Requests
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Recent ride requests from passengers
                </p>
              </div>

              {rideRequests.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {rideRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        {/* Location Details */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {request.pickup}
                              </p>
                              <p className="text-sm text-gray-500">
                                to {request.dropoff}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fare & Time */}
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Fare</p>
                          <p className="font-medium text-green-600">
                            ${request.fare}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Requested</p>
                          <p className="text-sm font-medium text-gray-800">
                            {request.time}
                          </p>
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
                    <h3 className="text-lg font-medium text-gray-900">
                      No requests available
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      New ride requests will appear here automatically
                    </p>
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
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm z-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 relative border border-gray-100 animate-pop-in">
                  {/* Close Button */}
                  <button
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                    onClick={() => setShowReviewModal(false)}
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      Rate Your Passenger
                    </h2>
                    <p className="text-gray-500">
                      Your feedback helps improve the community
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-4xl transition-all duration-150 ${
                          rating >= star
                            ? "text-yellow-400"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                        onClick={() => setRating(star)}
                      >
                        {rating >= star ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mb-6">
                    {rating
                      ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][
                          rating - 1
                        ]
                      : "Tap to rate"}
                  </p>

                  {/* Review Text Area */}
                  <div className="mb-6">
                    <textarea
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-all duration-200 resize-none"
                      placeholder="Tell us about your experience (optional)..."
                      rows={4}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                      onClick={() => setShowReviewModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={submitReview}
                      disabled={!rating}
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

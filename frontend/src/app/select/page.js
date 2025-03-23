"use client";

import React, { useEffect, useState } from "react";
import { Car, Compass, Bike } from "lucide-react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { toast } from "sonner";

const SelectRide = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [pickLoc, setPickLoc] = useState(null);
  const [dropLoc, setDropLoc] = useState(null);
  const [pickCoordinates, setPickCoordinates] = useState(null);
  const [dropCoordinates, setDropCoordinates] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pickLoc = JSON.parse(localStorage.getItem("pickLocCoordinates"));
      const dropLoc = JSON.parse(localStorage.getItem("dropLocCoordinates"));
      const pickLocStr = localStorage.getItem("pickLocation");
      const dropLocStr = localStorage.getItem("dropLocation");

      if (pickLoc && dropLoc && pickLocStr && dropLocStr) {
        setPickLoc(pickLocStr);
        setDropLoc(dropLocStr);
        setPickCoordinates(pickLoc);
        setDropCoordinates(dropLoc);
      }
    }
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    const handleRideAccepted = ({ driverId }) => {
      toast.success(`Ride accepted by Driver ${driverId}`);
      router.push("/eta");
    };

    socket.on("ride_accepted", handleRideAccepted);

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      toast.error("Failed to connect to the server");
    });

    return () => {
      socket.off("ride_accepted", handleRideAccepted);
      socket.disconnect();
    };
  }, []);

  const Haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const phi_1 = (lat1 * Math.PI) / 180;
    const phi_2 = (lat2 * Math.PI) / 180;
    const diff_phi = ((lat2 - lat1) * Math.PI) / 180;
    const diff_lambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(diff_phi / 2) * Math.sin(diff_phi / 2) +
      Math.cos(phi_1) *
        Math.cos(phi_2) *
        Math.sin(diff_lambda / 2) *
        Math.sin(diff_lambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.ceil(R * c);
  };

  const pricing = [
    { baseFare: 50, perKm: 15, perMin: 2, serviceFee: 10 },
    { baseFare: 30, perKm: 12, perMin: 1.5, serviceFee: 8 },
    { baseFare: 20, perKm: 10, perMin: 1, serviceFee: 5 },
    { baseFare: 15, perKm: 8, perMin: 0.8, serviceFee: 3 },
  ];

  const rides = [
    {
      name: "Premium Cab",
      desc: "Luxury vehicles with top drivers",
      icon: <Car />,
      speed: 13.888,
    },
    {
      name: "Standard Cab",
      desc: "Comfortable rides up to 4",
      icon: <Car />,
      speed: 13.888,
    },
    {
      name: "Auto",
      desc: "Affordable rides up to 3 people",
      icon: <Compass />,
      speed: 8.333,
    },
    {
      name: "Bike",
      desc: "Quick rides for single passenger",
      icon: <Bike />,
      speed: 11.11,
    },
  ];

  const distance =
    pickCoordinates && dropCoordinates
      ? Haversine(
          pickCoordinates[0],
          pickCoordinates[1],
          dropCoordinates[0],
          dropCoordinates[1]
        )
      : null;

  const estimatedTime = (rideSpeed) => {
    if (!distance || !rideSpeed) return null;
    return Math.ceil(distance / (rideSpeed * 60));
  };

  const estimatedPrice = (selected) => {
    if (!distance) return null;
    const { baseFare, perKm, serviceFee } = pricing[selected];
    const distanceKm = distance / 1000;
    return baseFare + perKm * Math.ceil(distanceKm) + serviceFee;
  };

  const sendBookingRequest = () => {
    if (!pickCoordinates || !dropCoordinates) {
      return;
    }
    const price = estimatedPrice(selected);
    const bookingData = {
      rideType: selected,
      pickLoc,
      dropLoc,
      pickCoordinates,
      dropCoordinates,
      price: estimatedPrice(selected),
      booking_date: new Date().toISOString(), // Use a consistent format
    };

    localStorage.setItem("ridePrice", JSON.stringify(price));

    console.log("Sending booking request");
    const socket = io("http://localhost:5000");
    socket.emit("book_request", bookingData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-6 rounded-lg md:shadow-xl md:border md:border-neutral-200 bg-white sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Select Ride Type</h1>
        <p className="text-neutral-600">Choose the type of ride you want</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rides.map((ride, index) => (
          <div
            key={index}
            onClick={() => setSelected(index)}
            className={`${
              index === selected
                ? "border-black border-2"
                : "border-neutral-300"
            } cursor-pointer flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 text-gray-600">{ride.icon}</div>
              <div>
                <h3 className="text-lg font-medium">{ride.name}</h3>
                <p className="text-neutral-700 text-sm">{ride.desc}</p>
              </div>
            </div>
            {distance && (
              <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                {estimatedTime(ride.speed)} min
              </p>
            )}
          </div>
        ))}
        <hr className="border-t border-neutral-700" />
        <div className="p-4 border border-neutral-300 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h3 className="text-lg font-medium">Estimated Price</h3>
            {distance && (
              <h2 className="font-medium text-xl text-gray-800">
                ₹{estimatedPrice(selected)}
              </h2>
            )}
          </div>
          <p className="text-base text-neutral-700 mt-1">
            Price may vary due to traffic and waiting time
          </p>
        </div>
        <div className="flex gap-x-3">
          <button
            className="py-2 px-3 bg-black text-white rounded-md"
            onClick={() => router.push("/booking")}
          >
            Back
          </button>
          <button
            className="py-2 px-3 border border-black rounded-md"
            onClick={sendBookingRequest}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRide;

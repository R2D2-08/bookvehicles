"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { ArrowRight } from "lucide-react";
import { useMap } from "react-leaflet";

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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const Booking = () => {
  const locationApi =
    "https://nominatim.openstreetmap.org/search?format=json&q=";
  const defaultPosition = [51.505, -0.09];

  const [pickLocation, setPickLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickLatLong, setPickLatLong] = useState(null);
  const [dropLatLong, setDropLatLong] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);

  // Load Leaflet dynamically on the client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        setCustomIcon(
          new L.Icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          })
        );
      });
    }
  }, []);

  useEffect(() => {
    const fetchCoordinates = async (location, setLatLong) => {
      if (!location) return;

      try {
        const response = await fetch(`${locationApi}${encodeURIComponent(location)}`);
        if (!response.ok) {
          throw new Error("Location fetch failed");
        }
        const res = await response.json();
        if (res.length > 0) {
          const { lat, lon } = res[0];
          setLatLong([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCoordinates(pickLocation, setPickLatLong);
    fetchCoordinates(dropLocation, setDropLatLong);
  }, [pickLocation, dropLocation]);

  const SetView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 13);
      }
    }, [center, map]);
    return null;
  };

  return (
    <div className="flex items-center justify-center py-10 bg-white">
      <div className="flex rounded-2xl shadow-2xl w-[60%] bg-white p-10">
        <section className="w-1/2 pr-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Booking</h1>
            <p className="text-gray-500">Book your ride within seconds</p>
          </div>

          <div className="mb-6">
            <label htmlFor="pickup" className="block mb-2 text-md font-medium">
              Pickup Location
            </label>
            <input
              id="pickup"
              value={pickLocation}
              onChange={(e) => setPickLocation(e.target.value)}
              type="text"
              placeholder="Enter Pickup Location"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="drop" className="block mb-2 text-md font-medium">
              Drop Location
            </label>
            <input
              id="drop"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              type="text"
              placeholder="Enter Drop Location"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="bg-black text-white text-md px-3 py-2 rounded-md flex items-center gap-2">
            Select your ride <ArrowRight />
          </button>
        </section>

        {/* Map Section */}
        <div className="w-1/2 h-[350px]">
          <MapContainer
            center={defaultPosition}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full rounded-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {pickLatLong && customIcon && (
              <>
                <SetView center={pickLatLong} />
                <Marker position={pickLatLong} icon={customIcon}>
                  <Popup>Pickup Location</Popup>
                </Marker>
              </>
            )}

            {dropLatLong && customIcon && (
              <>
                <SetView center={dropLatLong} />
                <Marker position={dropLatLong} icon={customIcon}>
                  <Popup>Drop Location</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Booking;

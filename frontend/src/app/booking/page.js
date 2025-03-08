"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { ArrowRight, MapPin } from "lucide-react";
import { useMap } from "react-leaflet";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const locationApi = "https://nominatim.openstreetmap.org/search?format=json&q=";
  const defaultPosition = [51.505, -0.09];

  const [pickLocation, setPickLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [pickLatLong, setPickLatLong] = useState(null);
  const [dropLatLong, setDropLatLong] = useState(null);
  const [customIcon, setCustomIcon] = useState(null);

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
        if (!response.ok) throw new Error("Location fetch failed");

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
      if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100">
      <div className="w-full md:w-1/3 p-6 flex flex-col justify-center bg-white md:min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">Book a Ride</h1>

        <div className="relative mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">Pickup Location</label>
          <div className="relative">
            <input
              value={pickLocation}
              onChange={(e) => setPickLocation(e.target.value)}
              type="text"
              placeholder="Enter pickup location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <MapPin className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
        </div>

        <div className="relative mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-2">Drop Location</label>
          <div className="relative">
            <input
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              type="text"
              placeholder="Enter drop location"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <MapPin className="absolute right-3 top-3 text-gray-400" size={20} />
          </div>
        </div>


        <button onClick={() => router.push("/select")} className="cursor-point w-full bg-black text-white py-3 rounded-lg flex justify-center items-center gap-2 text-lg font-medium">
          Find a Ride <ArrowRight size={20} />
        </button>
      </div>

      <div className="w-full md:w-2/3 h-[50vh] md:h-screen relative">
        <MapContainer
          center={defaultPosition}
          zoom={12}
          scrollWheelZoom={false}
          className="w-full h-full rounded-lg"
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

          {/* Drop Marker */}
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
  );
};

export default Booking;

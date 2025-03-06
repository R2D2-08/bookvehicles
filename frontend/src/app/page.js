"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import dynamic from "next/dynamic";

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

export default function Home() {
  const position = [51.505, -0.09];
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    if (typeof window !== undefined && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log("Geolocation is not supported on this device");
    }
  }, []);

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
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-50">
      <div className="min-h-screen w-full flex flex-col items-center bg-gray-50">
        <section className="flex flex-col md:flex-row items-center gap-12 p-10 max-w-6xl w-[85%]">
          <div className="text-center md:text-left flex flex-col gap-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-snug">
              Get a ride in minutes—anywhere, anytime.
            </h1>
            <p className="text-lg text-gray-700">
              Login to book a cab, view past trips, and get tailored ride
              suggestions.
            </p>
            <div className="flex gap-4">
              <Link href={"/login"}>
                <button className="cursor-pointer rounded-2xl text-white bg-black w-[150px] h-[60px] text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
                  Login
                </button>
              </Link>
              <Link href={"/signup"}>
                <button className="cursor-pointer rounded-2xl text-black border-2 border-black w-[150px] h-[60px] text-lg font-semibold hover:bg-gray-200 transition-all duration-300">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
          <MapContainer
            center={userLocation || position}
            zoom={13}
            scrollWheelZoom={false}
            className="w-[600px] h-[400px] rounded-xl shadow-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && (
              <>
                <SetView center={userLocation} />
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </section>

        <section className="max-w-6xl w-[85%] text-center py-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">1. Request</h3>
              <p className="text-gray-700 mt-2">
                Enter your destination and choose a ride that fits your needs.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">2. Ride</h3>
              <p className="text-gray-700 mt-2">
                Get matched with a nearby driver and track your ride.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">3. Pay & Rate</h3>
              <p className="text-gray-700 mt-2">
                Arrive at your destination, pay easily, and rate your driver.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center text-center py-12 px-6 bg-gray-200 w-full">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get a ride instantly
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Use your location to find the nearest available ride.
          </p>
          <button className="rounded-2xl text-white bg-black py-4 px-8 text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
            Use My Location
          </button>
        </section>
      </div>
      <section className="flex flex-col md:flex-row items-center gap-12 p-10 max-w-6xl w-[85%]">
        <div className="text-center md:text-left flex flex-col gap-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-snug">
            Get there, your way
          </h1>
          <p className="text-lg text-gray-700">
            Seamless rides, reliable drivers, and effortless booking. Move
            smarter with just a tap.
          </p>
          <button className="w-full md:w-auto rounded-2xl text-white bg-black py-4 px-8 text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
            Book a Ride
          </button>
        </div>

        <div className="relative w-full md:w-[900px] h-[500px] overflow-hidden rounded-xl shadow-2xl">
          <Image
            src="/images/ride_sharing_scene.jpg"
            alt="Ride Sharing Scene"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center gap-12 p-10 max-w-6xl w-[85%]">
        <div className="relative w-full md:w-[900px] h-[500px] overflow-hidden rounded-xl shadow-2xl">
          <Image
            src="/images/image_converted.jpg"
            alt="Luxury Ride Experience"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
        <div className="text-center md:text-left flex flex-col gap-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-snug">
            Ride in comfort and style
          </h1>
          <p className="text-lg text-gray-700">
            Choose from economy to premium rides and get to your destination
            hassle-free.
          </p>
          <button className="w-full md:w-auto rounded-2xl text-white bg-black py-4 px-8 text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
            Explore Rides
          </button>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center gap-12 p-10 max-w-6xl w-[85%]">
        <div className="text-center md:text-left flex flex-col gap-6">
          <h1 className="text-6xl font-bold text-gray-900 leading-snug">
            Your ride, your rules
          </h1>
          <p className="text-lg text-gray-700">
            Whether commuting, traveling, or running errands, Uber gets you
            there effortlessly.
          </p>
          <button className="w-full md:w-auto rounded-2xl text-white bg-black py-4 px-8 text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
            Get Started
          </button>
        </div>

        <div className="relative w-full md:w-[900px] h-[500px] overflow-hidden rounded-xl shadow-2xl">
          <Image
            src="/images/ride_sharing_scene.jpg"
            alt="Ride Sharing Scene"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
      </section>
    </div>
  );
}

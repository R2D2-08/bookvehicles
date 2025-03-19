"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Info,
  Star,
  MapPin,
  Award,
  Briefcase,
  CheckCircle,
} from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState({});
  useEffect(() => {
    fetch("http://localhost:5000/api/users/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        console.log(data.user);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  return (
    <section className="min-h-screen w-full flex flex-col md:flex-row items-center bg-gray-100 p-6">
      <div className="md:w-1/3 w-full flex justify-center p-4">
        <div className="p-6 bg-white shadow-xl rounded-lg text-center w-full max-w-sm">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto border-4 border-gray-300">
            <Image
              src="/images/profile_photo.jfif"
              alt="User Profile"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="text-2xl font-semibold mt-4 flex justify-center items-center gap-2">
            <User size={20} /> {user.user.name}
          </h1>
          <p className="text-gray-700 flex justify-center items-center gap-2 mt-2 text-sm">
            <Mail size={18} /> {user.user.email}
          </p>
          <p className="mt-2 text-gray-600 flex justify-center items-center gap-2 text-sm">
            <Info size={18} /> India
          </p>
          <p className="mt-4 text-gray-600 flex justify-center items-center gap-2 text-sm">
            <Briefcase size={18} /> Gold Member
          </p>
        </div>
      </div>

      <div className="md:w-2/3 w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">User Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col items-center">
            <Star size={30} />
            <h3 className="text-xl font-semibold mt-2">{user.user.rating}</h3>
            <p className="text-sm">Average Review</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col items-center">
            <MapPin size={30} />
            <h3 className="text-xl font-semibold mt-2">12,500 km</h3>
            <p className="text-sm">Total Distance Traveled</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col items-center">
            <Award size={30} />
            <h3 className="text-xl font-semibold mt-2">
              {user.passenger.points}
            </h3>
            <p className="text-sm">Total Points Earned</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col items-center">
            <CheckCircle size={30} />
            <h3 className="text-xl font-semibold mt-2">98</h3>
            <p className="text-sm">Completed Trips</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  MapPin,
  Star,
  Award,
  CheckCircle,
  Phone,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

const UserProfile = () => {
  const [user, setUser] = useState({
    user: {
      name: "",
      email: "",
      phone_no: "",
      rating: 0
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          toast.error("Profile fetch failed");
          console.log(response);
        }
        const data = await response.json();
        setUser(data);
        console.log(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center md:items-start space-y-6">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <Image
                src="/images/profile_photo.jfif"
                alt="User Profile"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <User size={32} /> {user.user?.name ?? "User"}
            </h1>
            <p className="text-lg flex items-center gap-3">
              <Mail size={20} /> {user.user?.email ?? "Email"}
            </p>
            <p className="text-lg flex items-center gap-3">
              <Phone size={20} /> {user.user?.phone_no ?? "Phone Number"}
            </p>
            <p className="text-lg flex items-center gap-3">
              <Briefcase size={20} /> Gold Member
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            User Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Average Rating Card */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <Star size={40} className="text-yellow-300 mx-auto" />
              <h3 className="text-2xl font-bold mt-4">{user.user.rating ?? 0}</h3>
              <p className="text-sm text-gray-100">Average Rating</p>
            </div>

            {/* Completed Trips Card */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <CheckCircle size={40} className="text-white mx-auto" />
              <h3 className="text-2xl font-bold mt-4">98</h3>
              <p className="text-sm text-gray-100">Completed Trips</p>
            </div>

            {/* Distance Traveled Card */}
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <MapPin size={40} className="text-white mx-auto" />
              <h3 className="text-2xl font-bold mt-4">12,500 km</h3>
              <p className="text-sm text-gray-100">Distance Traveled</p>
            </div>

            {/* Points Earned Card */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <Award size={40} className="text-white mx-auto" />
              <h3 className="text-2xl font-bold mt-4">{user.passenger.points ?? 0}</h3>
              <p className="text-sm text-gray-100">Points Earned</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;

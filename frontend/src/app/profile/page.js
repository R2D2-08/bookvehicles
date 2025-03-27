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
  BadgeCheck, 
  Shield, 
  Clock, 
  Car, 
  UserCircle
} from "lucide-react";
import { toast } from "sonner";

const UserProfile = () => {
  const [user, setUser] = useState({
    user: {
      name: "",
      email: "",
      phone_no: "",
      rating: 0,
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
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="container mx-auto px-4 py-12">
    {/* Profile Header */}
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl shadow-2xl p-8 mb-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="relative w-48 h-48 rounded-2xl border-4 border-white shadow-xl overflow-hidden">
          <Image
            src={user.user?.photo_url ? `http://localhost:5000${user.user?.photo_url}` : "/images/profile_photo.jfif"}
            alt="Driver Profile"
            fill
            sizes="(max-width: 768px) 192px, 256px"
            className="object-cover"
            priority
          />
        </div>
        <div className="text-white space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-bold flex items-center gap-4 justify-center md:justify-start">
            <User className="w-12 h-12" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-100">
              {user.user?.name}
            </span>
          </h1>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <BadgeCheck className="w-6 h-6 text-yellow-300 mr-2" />
              <span>Verified Professional</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <Shield className="w-6 h-6 text-green-300 mr-2" />
              <span>5-Star Safety Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <Star className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">4.98</p>
            <p className="text-gray-500">Average Rating</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">1.2k+</p>
            <p className="text-gray-500">Completed Rides</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">8 Years</p>
            <p className="text-gray-500">Experience</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Award className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">Platinum</p>
            <p className="text-gray-500">Driver Tier</p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Driver Details Card */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-red-600" />
          Driver Profile
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Contact Number</label>
            <p className="font-medium flex items-center gap-2">
              <Phone className="w-5 h-5" /> {user.user?.phone_no}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Email Address</label>
            <p className="font-medium flex items-center gap-2">
              <Mail className="w-5 h-5" /> {user.user?.email}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">License Number</label>
            <p className="font-medium">DL-042022-987654</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Languages</label>
            <p className="font-medium">English, Spanish, French</p>
          </div>
        </div>
      </div>

      {/* Vehicle Card */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Car className="w-8 h-8 text-red-600" />
          Vehicle Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Car className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold">Ferrari R-800</p>
              <p className="text-sm text-gray-500">Luxury Sedan</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">License Plate</p>
              <p className="font-medium">ABC-1234</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year</p>
              <p className="font-medium">2023</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Color</p>
              <p className="font-medium">Rosso Corsa</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">4 passengers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Card */}
      <div className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Star className="w-8 h-8 text-red-600" />
          Recent Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((review) => (
            <div key={review} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
              <p className="font-medium mb-2">"Exceptional service! Perfect ride."</p>
              <p className="text-sm text-gray-600">- Sarah Johnson</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export default UserProfile;
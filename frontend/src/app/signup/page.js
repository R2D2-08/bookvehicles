"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Signup() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    phone_no: "",
    photo_url: null,
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setUser({
      ...user,
      photo_url: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", user.username);
      formData.append("email", user.email);
      formData.append("password", user.password);
      formData.append("phone_no", user.phone_no);
      if (user.photo_url) {
        formData.append("photo_url", user.photo_url);
      }

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Failed to Signup");
        return;
      }

      const data = await response.json();
      toast.success("Registration Successful");
      router.push("/login");
    } catch (error) {
      toast.error("Internal Server Issue");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex h-full">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Create your account</h1>
              <p className="text-gray-600 mb-8">Join our community today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name<span className="text-red-500">*</span>
                </label>
                <input
                  value={user.username}
                  onChange={handleChange}
                  type="text"
                  name="username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  value={user.phone_no}
                  onChange={handleChange}
                  type="tel"
                  name="phone_no"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  value={user.email}
                  onChange={handleChange}
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  value={user.password}
                  onChange={handleChange}
                  type="password"
                  name="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profile-upload"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    {user.photo_url ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={URL.createObjectURL(user.photo_url)}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover mb-2"
                        />
                        <span className="text-blue-600 text-sm">
                          Change photo
                        </span>
                      </div>
                    ) : (
                      <div className="py-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">
                          Click to upload profile photo
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </span>
              </Link>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome!</h2>
              <p className="opacity-90 mb-8 text-lg">
                Join thousands of users who trust our platform
              </p>
              <div className="relative w-full h-64">
                <div className="absolute inset-0 bg-indigo-500 rounded-lg opacity-20"></div>
                <div className="absolute inset-4 flex items-center justify-center">
                  <svg
                    className="w-full h-full text-white opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
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
        formData.append("profileImage", user.photo_url);
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
    <div className="flex items-center justify-center py-10 bg-white">
      <div className="relative flex flex-col m-6 space-y-4 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-6 md:p-10">
          <h1 className="mb-1 text-3xl font-bold">Register your account</h1>
          <p className="font-light text-gray-400 mb-2">Enter your details</p>
          <form onSubmit={handleSubmit}>
            <div className="py-1">
              <label htmlFor="name" className="mb-1 text-md">
                Name
              </label>
              <input
                value={user.username}
                onChange={handleChange}
                type="text"
                name="username"
                id="username"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your name"
              />
            </div>
            <div className="py-4">
              <label htmlFor="phone_no" className="mb-2 text-md">
                Phone Number
              </label>
              <input
                value={user.phone_no}
                onChange={handleChange}
                type="text"
                name="phone_no"
                id="phone_no"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your phone"
              />
            </div>
            <div className="py-4">
              <label htmlFor="email" className="mb-2 text-md">
                Email
              </label>
              <input
                value={user.email}
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
              />
            </div>

            <div className="py-4">
              <label htmlFor="password" className="mb-2 text-md">
                Password
              </label>
              <input
                value={user.password}
                onChange={handleChange}
                type="password"
                name="password"
                id="password"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your password"
              />
            </div>
            <div className="py-4">
              <label className="mb-2 text-md block">Profile Picture</label>
              <div className="relative w-full border border-gray-300 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="file"
                  accept="image/*"
                  name="profileImage"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
                <p className="text-gray-500 text-center">
                  {user.photo_url ? "Change Image" : "Click to Upload Image"}
                </p>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg mt-3 hover:bg-white hover:text-black border hover:border-gray-300 transition"
            >
              Sign Up
            </button>
            {user.photo_url && (
              <img
                src={URL.createObjectURL(user.photo_url)}
                alt="Preview"
                className="mt-4 mx-auto rounded-md w-32 h-32 object-cover"
              />
            )}
          </form>
          <div className="text-center text-gray-400">
            Already have an account?
            <Link href="/login">
              <span className="font-bold text-black"> Sign in </span>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <img
            src="/images/hero_image.jpg"
            alt="Signup Illustration"
            className="w-[400px] h-full rounded-r-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Signup;

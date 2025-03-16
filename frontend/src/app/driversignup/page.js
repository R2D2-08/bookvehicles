"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function DriverSignup() {
  const router = useRouter();
  const [driver, setDriver] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
  });

  const handleChange = (e) => {
    setDriver({
      ...driver,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("<api>", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          password: driver.password,
          licenseNumber: driver.licenseNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      localStorage.setItem("AccessToken", data.access);
      localStorage.setItem("RefreshToken", data.refresh);

      router.push("/");
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div className="flex items-center justify-center py-10 bg-white">
      <div className="relative flex flex-col m-6 space-y-4 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-6 md:p-10">
          <h1 className="mb-1 text-3xl font-bold">Driver Registration</h1>
          <p className="font-light text-gray-400 mb-2">Enter your details</p>
          <form onSubmit={handleSubmit}>
            <div className="py-1">
              <label htmlFor="name" className="mb-1 text-md">Name</label>
              <input
                value={driver.name}
                onChange={handleChange}
                type="text"
                name="name"
                id="name"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your name"
              />
            </div>

            <div className="py-1">
              <label htmlFor="email" className="mb-1 text-md">Email</label>
              <input
                value={driver.email}
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
              />
            </div>

            <div className="py-1">
              <label htmlFor="phone" className="mb-1 text-md">Phone Number</label>
              <input
                value={driver.phone}
                onChange={handleChange}
                type="tel"
                name="phone"
                id="phone"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="py-1">
              <label htmlFor="password" className="mb-1 text-md">Password</label>
              <input
                value={driver.password}
                onChange={handleChange}
                type="password"
                name="password"
                id="password"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your password"
              />
            </div>

            <div className="py-1">
              <label htmlFor="licenseNumber" className="mb-1 text-md">License Number</label>
              <input
                value={driver.licenseNumber}
                onChange={handleChange}
                type="text"
                name="licenseNumber"
                id="licenseNumber"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your license number"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg mt-3 hover:bg-white hover:text-black border hover:border-gray-300 transition"
            >
              Sign up
            </button>
          </form>
          <div className="text-center text-gray-400 mt-1">
            Already have an account?
            <Link href="/login">
              <span className="font-bold text-black"> Sign in </span>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <img
            src="/images/hero_image.jpg"
            alt="Driver Signup Illustration"
            className="w-[400px] h-full rounded-r-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default DriverSignup;

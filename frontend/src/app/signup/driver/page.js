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
    photo_url: ""
  });

  const handleChange = (e) => {
    setDriver({
      ...driver,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file){
        setDriver({
        ...driver,
        photo: file,
        photoPreview: URL.createObjectURL(file),
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", driver.username);
      formData.append("email", driver.email);
      formData.append("password", driver.password);
      formData.append("phone_no", driver.phone_no);
      formData.append("licenseNumber", driver.licenseNumber);
      if (driver.photo_url) {
        formData.append("photo", driver.photo_url);
      }

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      localStorage.setItem("AccessToken", data.access);
      localStorage.setItem("RefreshToken", data.refresh);
      alert("Registration successful!");
      router.push("/login");
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

            {/* Image Upload Section */}
            <div className="py-1">
              <label htmlFor="photo" className="mb-2 text-md items-center">Upload Photo</label>
              <input
                type="file"
                name="photo"
                id="photo"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Image Preview */}
            {driver.photoPreview && (
              <div className="mt-3 flex flex-col items-center">
                <p className="text-gray-600">Preview:</p>
                <img
                  src={driver.photoPreview}
                  alt="Driver Preview"
                  className="w-32 h-32 rounded-lg border border-gray-300 mt-2"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg mt-3 hover:bg-white hover:text-black border hover:border-gray-300 transition delay-30 ease-in"
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

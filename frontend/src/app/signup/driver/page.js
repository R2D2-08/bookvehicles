"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function DriverSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [driver, setDriver] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    license_no: "",
    photo_url: null,
  });

  const [vehicle, setVehicle] = useState({
    vehicle_no: "",
    type: "",
    capacity: "",
    model: "",
    image_url: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (step === 1) {
      setDriver((prev) => ({ ...prev, [name]: value }));
    } else {
      setVehicle((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDriverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDriver((prev) => ({
        ...prev,
        photo_url: file,
      }));
    }
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicle((prev) => ({
        ...prev,
        image_url: file,
      }));
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(driver).forEach(([key, value]) => {
        if (key === "photo_url" && value) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      });

      Object.entries(vehicle).forEach(([key, value]) => {
        if (key === "image_url" && value) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      });

      formData.append("role", "driver");

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Some error has occured, please try again");
        return;
      }

      toast.success("Registration Successful");
      router.push("/login");
    } catch (error) {
      toast.error("Internal Server Error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden lg:shadow-lg">
        <div className="md:flex">
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Driver Network</h2>
              <p className="opacity-90">
                Earn money on your schedule with flexible driving opportunities
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {step === 1 ? "Driver Information" : "Vehicle Details"}
              </h1>
              <div className="flex space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    step === 1 ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    step === 2 ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(driver)
                    .filter(key => key !== "photo_url" && key !== "password")
                    .map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/_/g, " ")}
                        </label>
                        <input
                          value={driver[key] || ""}
                          onChange={handleChange}
                          type="text"
                          name={key}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        />
                      </div>
                    ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    value={driver.password || ""}
                    onChange={handleChange}
                    type="password"
                    name="password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      name="photo_url"
                      className="hidden"
                      id="photo-upload"
                      onChange={handleDriverPhotoChange}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {driver.photo_url ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={URL.createObjectURL(driver.photo_url)}
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
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition mt-4"
                >
                  Continue to Vehicle Details
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(vehicle)
                    .filter(key => key !== "image_url")
                    .map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/_/g, " ")}
                        </label>
                        <input
                          value={vehicle[key] || ""}
                          onChange={handleChange}
                          type="text"
                          name={key}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        />
                      </div>
                    ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer">
                    <input
                      type="file"
                      name="image_url"
                      className="hidden"
                      id="vehicle-upload"
                      onChange={handleVehicleImageChange}
                    />
                    <label htmlFor="vehicle-upload" className="cursor-pointer">
                      {vehicle.image_url ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={URL.createObjectURL(vehicle.image_url)}
                            alt="Vehicle Preview"
                            className="w-full h-32 object-contain mb-2"
                          />
                          <span className="text-blue-600 text-sm">
                            Change vehicle photo
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
                            Click to upload vehicle photo
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login">
                <p className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverSignup;
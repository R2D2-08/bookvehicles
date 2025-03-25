"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function DriverSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [driver, setDriver] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    license_no: ""
  });
  const [vehicle, setVehicle] = useState({
    vehicle_no: "",
    type: "",
    capacity: "",
    model: "",
    vehicle_image: null,
    photoPreview: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    step === 1
      ? setDriver({ ...driver, [name]: value })
      : setVehicle({ ...vehicle, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicle({
        ...vehicle,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(driver).forEach(([key, value]) => formData.append(key, value));
      Object.entries(vehicle).forEach(([key, value]) => {
        if (key !== "photoPreview") formData.append(key, value);
      });

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        console.log("Registration failed");
        return;
      }
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
          {step === 1 ? (
            <>
              <h1 className="mb-1 text-3xl font-bold">Driver Registration</h1>
              <p className="font-light text-gray-400 mb-2">Enter your details</p>
              <form>
                {Object.keys(driver).map((key) => (
                  <div className="py-1" key={key}>
                    <label htmlFor={key} className="mb-1 text-md capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      value={driver[key]}
                      onChange={handleChange}
                      type={key === "password" ? "password" : "text"}
                      name={key}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder={`Enter your ${key}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-black text-white p-2 rounded-lg mt-3 hover:bg-gray-800"
                >
                  Next
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-3xl font-bold">Vehicle Details</h1>
              <p className="font-light text-gray-400 mb-2">Enter your vehicle details</p>
              <form onSubmit={handleSubmit}>
                {Object.keys(vehicle).map((key) => (
                  key !== "photoPreview" && (
                    <div className="py-1" key={key}>
                      <label htmlFor={key} className="mb-1 text-md capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <input
                        value={key === "photo" ? "" : vehicle[key]}
                        onChange={handleChange}
                        type={key === "photo" ? "file" : "text"}
                        name={key}
                        accept={key === "photo" ? "image/*" : ""}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder={`Enter your ${key}`}
                        onChange={key === "photo" ? handleImageChange : handleChange}
                      />
                    </div>
                  )
                ))}
                {vehicle.photoPreview && (
                  <div className="mt-3 flex flex-col items-center">
                    <p className="text-gray-600">Photo Preview:</p>
                    <img
                      src={vehicle.photoPreview}
                      alt="Vehicle Preview"
                      className="w-32 h-32 rounded-lg border border-gray-300 mt-2"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-black text-white p-2 rounded-lg mt-3 hover:bg-gray-800"
                >
                  Submit
                </button>
              </form>
            </>
          )}
          <div className="text-center text-gray-400 mt-1">
            Already have an account?
            <Link href="/login">
              <span className="font-bold text-black"> Sign in </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverSignup;
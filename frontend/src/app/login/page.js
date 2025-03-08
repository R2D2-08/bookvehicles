"use client";
import React, { useState } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation";
import Image from "next/image";

function Login() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
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
          username: user.name,
          password: user.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }

      const data = await response.json();
      localStorage.setItem("AccessToken", data.access);
      localStorage.setItem("RefreshToken", data.refresh);

      router.push("/");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <h1 className="mb-3 text-4xl font-bold">Welcome back</h1>
          <p className="font-light text-gray-400 mb-8">
            Welcome back! Please enter your details
          </p>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <label htmlFor="name" className="mb-2 text-md">
                Name
              </label>
              <input
                value={user.name}
                onChange={handleChange}
                type="text"
                name="name"
                id="name"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your name"
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
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black border hover:border-gray-300 transition"
            >
              Log in
            </button>
          </form>
          <div className="text-center text-gray-400">
            Don&apos;t have an account?
            <Link href="/signup">
              <span className="font-bold text-black"> Sign up </span>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <img
            src="/images/hero_image.jpg"
            alt="Login Illustration"
            className="w-[400px] h-full rounded-r-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;

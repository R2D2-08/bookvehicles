"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  User,
  Car,
  CreditCard,
  Activity,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react"; // Added Menu and X icons for mobile

function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    drivers: 120,
    users: 450,
    rides: 3000,
    revenue: 50000,
  });
  const [drivers, setDrivers] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [rides, setRides] = useState([]);
  const [payments, setPayments] = useState([]);
  const [view, setView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("http://localhost:5000/api/users/stats", {
          credentials: "include", // Include cookies if authentication is needed
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);
  
  useEffect(() => {
    async function fetchData(endpoint, setter) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${endpoint}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    }
  
    if (view === "drivers") {
      fetchData("drivers", setDrivers);
    } else if (view === "passengers") {
      fetchData("passengers", setPassengers);
    } else if (view === "rides") {
      fetchData("rides", setRides);
    } else if (view === "payments") {
      fetchData("payments", setPayments);
    }
  }, [view]);
  

  const handleLogout = () => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("RefreshToken");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`w-64 bg-gray-800 p-6 fixed md:relative h-full transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 z-40`}
      >
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Activity size={24} /> Admin Panel
        </h1>
        <nav className="space-y-3">
          <button
            onClick={() => {
              setView("dashboard");
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
              view === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
            }`}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            onClick={() => {
              setView("drivers");
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
              view === "drivers" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
            }`}
          >
            <Car size={18} /> Drivers
          </button>
          <button
            onClick={() => {
              setView("passengers");
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
              view === "passengers" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
            }`}
          >
            <User size={18} /> Passengers
          </button>
          <button
            onClick={() => {
              setView("rides");
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
              view === "rides" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
            }`}
          >
            <Car size={18} /> Rides
          </button>
          <button
            onClick={() => {
              setView("payments");
              setIsSidebarOpen(false); // Close sidebar on mobile
            }}
            className={`w-full flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
              view === "payments" ? "bg-blue-600 text-white" : "hover:bg-gray-700"
            }`}
          >
            <CreditCard size={18} /> Payments
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-2 px-4 mt-8 rounded-lg hover:bg-red-600 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {view === "dashboard" && (
          <>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users size={20} /> Drivers
                </h3>
                <p className="text-2xl mt-2">{stats.drivers}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <User size={20} /> Passengers
                </h3>
                <p className="text-2xl mt-2">{stats.users}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Car size={20} /> Rides
                </h3>
                <p className="text-2xl mt-2">{stats.rides}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard size={20} /> Revenue
                </h3>
                <p className="text-2xl mt-2">${stats.revenue ?? 0}</p>
              </div>
            </div>
          </>
        )}

        {view === "drivers" && (
          <div>
  <h2 className="text-2xl font-bold mb-6">Drivers</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {drivers.map((driver) => (
      <div
        key={driver.id}
        className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-4">
          <img
            src={driver.photo_url}
            alt={driver.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
          />
          <div>
            <h3 className="text-xl font-bold">{driver.name}</h3>
            <p className="text-gray-400">Role: {driver.role}</p>
          </div>
        </div>
        <div className="mt-4 text-gray-300">
          <p>📞 Phone No: {driver.phone_no}</p>
          <p>✉️ Email Address: {driver.email}</p>
          <p>⭐ Rating: {driver.rating ?? "N/A"}</p>
          <p>Joined: {new Date(driver.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
</div>

        )}

        {view === "passengers" && (
          <div>
  <h2 className="text-2xl font-bold mb-6">Passengers</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {passengers.map((passenger) => (
      <div
        key={passenger.id}
        className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-4">
          <img
            src={passenger.photo_url}
            alt={passenger.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
          />
          <div>
            <h3 className="text-xl font-bold">{passenger.name}</h3>
            <p className="text-gray-400">Role: {passenger.role}</p>
          </div>
        </div>
        <div className="mt-4 text-gray-300">
          <p>📞 Phone No.: {passenger.phone_no}</p>
          <p>✉️ Email Address: {passenger.email}</p>
          <p>⭐ Rating: {passenger.rating ?? "N/A"}</p>
          <p>Joined: {new Date(passenger.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
</div>

        )}

        {view === "rides" && (
          <div>
  <h2 className="text-2xl font-bold mb-6">Rides</h2>
  <div className="grid grid-cols-1 gap-4">
    {rides.map((ride) => (
      <div
        key={ride.ride_id}
        className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <h3 className="text-xl font-bold">Ride {ride.ride_id}</h3>
        <p className="text-gray-400">Driver: {ride.driver_id}</p>
        <p className="text-gray-400">Passenger: {ride.passenger_id}</p>
        <p className="text-gray-400">
          From: {ride.startLocation?.address || "Unknown"}
        </p>
        <p className="text-gray-400">
          To: {ride.endLocation?.address || "Unknown"}
        </p>
        <p className="text-gray-400">Fare: ${ride.fare}</p>
      </div>
    ))}
  </div>
</div>

        )}

        {view === "payments" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Payments</h2>
            <div className="grid grid-cols-1 gap-4">
              {payments.map((payment) => (
                <div
                  key={payment.transaction_id}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-bold">Payment {payment.transaction_id}</h3>
                  <p className="text-gray-400">Amount: ${payment.amount}</p>
                  <p className="text-gray-400">Status: {payment.payment_status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
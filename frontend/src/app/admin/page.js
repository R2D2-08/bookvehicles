"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    async function fetchStats() {
      try {
        // Simulating API call with dummy data
        const data = {
          drivers: 120,
          users: 450,
          rides: 3000,
          revenue: 50000,
        };
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (view === "drivers") {
      setDrivers([
        { id: 1, name: "John Doe", car: "Toyota Prius" },
        { id: 2, name: "Jane Smith", car: "Honda Civic" },
        { id: 3, name: "Mike Johnson", car: "Ford Focus" },
      ]);
    } else if (view === "passengers") {
      setPassengers([
        { id: 1, name: "Alice Johnson", rides: 25 },
        { id: 2, name: "Bob Brown", rides: 12 },
        { id: 3, name: "Cathy Lee", rides: 30 },
      ]);
    } else if (view === "rides") {
      setRides([
        { id: 1, driver: "John Doe", passenger: "Alice Johnson", start: "Downtown", destination: "Airport", fare: 25 },
        { id: 2, driver: "Jane Smith", passenger: "Bob Brown", start: "Uptown", destination: "Mall", fare: 15 },
        { id: 3, driver: "Mike Johnson", passenger: "Cathy Lee", start: "City Center", destination: "Stadium", fare: 20 },
      ]);
    } else if (view === "payments") {
      setPayments([
        { id: 1, driver: "John Doe", amount: 100, date: "2025-03-15", status: "Completed" },
        { id: 2, driver: "Jane Smith", amount: 150, date: "2025-03-14", status: "Pending" },
        { id: 3, driver: "Mike Johnson", amount: 120, date: "2025-03-13", status: "Completed" },
      ]);
    }
  }, [view]);

  const handleLogout = () => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("RefreshToken");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <nav className="space-y-2">
          <button onClick={() => setView("dashboard")} className="w-full text-left py-2 hover:text-gray-400">
            Dashboard
          </button>
          <button onClick={() => setView("drivers")} className="w-full text-left py-2 hover:text-gray-400">
            Drivers
          </button>
          <button onClick={() => setView("passengers")} className="w-full text-left py-2 hover:text-gray-400">
            Passengers
          </button>
          <button onClick={() => setView("rides")} className="w-full text-left py-2 hover:text-gray-400">
            Rides
          </button>
          <button onClick={() => setView("payments")} className="w-full text-left py-2 hover:text-gray-400">
            Payments
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {view === "dashboard" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold">Drivers</h3>
                <p className="text-xl">{stats.drivers}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold">Passengers</h3>
                <p className="text-xl">{stats.users}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold">Rides</h3>
                <p className="text-xl">{stats.rides}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold">Revenue</h3>
                <p className="text-xl">${stats.revenue}</p>
              </div>
            </div>
          </>
        )}
        {view === "drivers" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Drivers</h2>
            <div className="grid grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-bold">{driver.name}</h3>
                  <p>Car: {driver.car}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "passengers" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Passengers</h2>
            <div className="grid grid-cols-2 gap-4">
              {passengers.map((passenger) => (
                <div key={passenger.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-bold">{passenger.name}</h3>
                  <p>Rides: {passenger.rides}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "rides" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Rides</h2>
            <div className="grid grid-cols-1 gap-4">
              {rides.map((ride) => (
                <div key={ride.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-bold">Ride {ride.id}</h3>
                  <p>Driver: {ride.driver}</p>
                  <p>Passenger: {ride.passenger}</p>
                  <p>From: {ride.start}</p>
                  <p>To: {ride.destination}</p>
                  <p>Fare: ${ride.fare}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "payments" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Payments</h2>
            <div className="grid grid-cols-1 gap-4">
              {payments.map((payment) => (
                <div key={payment.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-bold">Payment {payment.id}</h3>
                  <p>Driver: {payment.driver}</p>
                  <p>Amount: ${payment.amount}</p>
                  <p>Date: {payment.date}</p>
                  <p>Status: {payment.status}</p>
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

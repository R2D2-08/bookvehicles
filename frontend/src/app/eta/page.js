"use client";
import React, { useEffect, useState } from "react";

function LiveETA() {
  const totalTime = 300; // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-3">Driver is on the way</h1>
      <p className="text-lg text-gray-500 mb-4">
        Estimated Arrival: {minutes}:{seconds < 10 ? `0${seconds}` : seconds} min
      </p>
      <div className="w-72 h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default LiveETA;

"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function PaymentPage() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePayment = async () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: 50000, // Example: 500.00 INR
      currency: "INR",
      name: "Uber Clone",
      description: "Ride Payment",
      handler: function (response) {
        setPaymentDone(true);
        console.log("Payment successful:", response);
      },
      theme: { color: "#007AFF" },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <motion.div
        className="bg-gray-100 p-6 rounded-lg shadow-lg w-80 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-3">Ride Completed 🎉</h1>

        {!paymentDone ? (
          <div>
            <p className="text-lg text-gray-600 mb-4">Please complete your payment</p>
            <button
              onClick={handlePayment}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition"
            >
              Pay with Razorpay
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg text-green-600 font-semibold">Payment Successful ✅</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Rate Your Driver</h2>
          <div className="flex justify-center my-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl mx-1 ${
                  rating >= star ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Write a review..."
            className="w-full p-2 bg-gray-200 border border-gray-400 rounded-lg text-gray-800 resize-none"
            rows="3"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full transition"
            onClick={() => alert("Review Submitted!")}
          >
            Submit Review
          </button>
        </div>
      </motion.div>
    </div>
  );
}

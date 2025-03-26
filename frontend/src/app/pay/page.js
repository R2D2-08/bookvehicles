"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PaymentPage() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [price, setPrice] = useState(0);
  const [rideId, setRideId] = useState(null);
  const [revieweeId, setRevieweeId] = useState(null);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const userId = localStorage.getItem("userId") || 7;
        if (!userId) {
          console.error("User not logged in.");
          return;
        }
        console.log(userId);/*
        const response = await fetch(`http://localhost:5000/api/rides/latest?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch ride details");
        }*/      
        const ridePrice = localStorage.getItem("ridePrice") || 1000;
        setPrice(ridePrice);
        setRideId(15);
        const driverId = localStorage.getItem("driverId") || 4;
        setRevieweeId(driverId);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      }
    };

    fetchRideDetails();
  }, []);

  const handlePayment = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: "rzp_test_pCp8FyWWmu8vhd",
        amount: price * 100,
        currency: "INR",
        name: "Vechicle Booking Service",
        description: "Ride Payment",
        handler: function (response) {
          setPaymentDone(true);
          console.log("Payment successful:", response);
          fetch("http://localhost:5000/api/users/update-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transaction_id: response.razorpay_payment_id,
              amount: price * 100, // Ensure price is in decimal format
              payment_status: 1, // Assuming 1 means success
            }),
          })
          .then(res => res.json())
          .then(data => console.log("Payment updated:", data))
          .catch(err => console.error("Error updating payment:", err));
        },
        theme: { color: "#007AFF" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
  };

  const handleReviewSubmit = async () => {
    if (!rideId || !revieweeId || rating === 0 || review.trim() === "") {
      alert("Please provide a rating and review.");
      return;
    }

    const reviewerId = localStorage.getItem("userId") || 7;
    if (!reviewerId) {
      alert("User not logged in.");
      return;
    }

    const payload = {
      ride_id: rideId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      review_text: review,
      review_type: "driver",
    };

    try {
      const response = await fetch("http://localhost:5000/api/users/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Review Submitted!");
      } else {
        const data = await response.json();
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong.");
    }
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
            onClick={handleReviewSubmit}
          >
            Submit Review
          </button>
        </div>
      </motion.div>
    </div>
  );
}

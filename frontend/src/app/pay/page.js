"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaCreditCard, 
  FaWallet, 
  FaStar, 
  FaPaperPlane, 
  FaRoute,
  FaCcVisa, 
  FaCcMastercard, 
  FaGooglePay, 
  FaPaypal 
} from "react-icons/fa";
import { GiCheckMark } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function PaymentPage() {
  const router = useRouter();
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
      toast.error("Please provide a rating and review.");
      return;
    }

    const reviewerId = localStorage.getItem("userId") || 7;
    if (!reviewerId) {
      toast.error("User not logged in.");
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
    console.log(payload);

    try {
      const response = await fetch("http://localhost:5000/api/users/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Review Submitted!");
      } else {
        const data = await response.json();
        toast.error("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong.");
    }
    router.push("/booking");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-50">
  <motion.div 
    className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-block mb-4"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
          <GiCheckMark className="text-4xl text-white animate-bounce" />
        </div>
      </motion.div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Ride Completed! 🎉
      </h1>
      <p className="text-lg text-gray-600">
        Thank you for choosing RideBook
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Ride Details */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaRoute className="text-purple-500" />
          Ride Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Pickup:</span>
            <span className="font-medium">Central Park</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dropoff:</span>
            <span className="font-medium">Times Square</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-medium">8.2 km</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaCreditCard className="text-blue-500" />
          Payment Details
        </h2>
        {!paymentDone ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <div className="flex justify-between text-lg font-bold mb-2">
                <span>Total:</span>
                <span>₹450.00</span>
              </div>
              <div className="text-sm text-gray-500">
                Includes all taxes and charges
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <FaWallet className="w-5 h-5" />
                Complete Payment
              </div>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <p className="text-lg font-semibold text-green-600">
              Payment Successful!
            </p>
            <p className="text-gray-600">
              ₹450.00 charged to your account
            </p>
          </motion.div>
        )}
      </div>
    </div>

    {/* Review Section */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 p-6 rounded-xl border border-gray-200"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <FaStar className="text-yellow-500" />
        Rate Your Experience
      </h2>
      
      <div className="flex justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            className={`text-4xl mx-2 transition-colors ${
              rating >= star ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-4"
      >
        <textarea
          placeholder="Share your experience... (Optional)"
          className="w-full p-4 bg-white border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none transition-all"
          rows="4"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button
          onClick={handleReviewSubmit}
          className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
        >
          <FaPaperPlane className="w-5 h-5" />
          Submit Review
        </button>
      </motion.div>
    </motion.div>

    {/* Payment Methods */}
    <div className="mt-6 text-center">
      <div className="flex justify-center gap-4 opacity-75">
        <FaCcVisa className="text-3xl text-blue-600" />
        <FaCcMastercard className="text-3xl text-red-600" />
        <FaGooglePay className="text-3xl text-purple-600" />
        <FaPaypal className="text-3xl text-blue-500" />
      </div>
      <p className="text-sm text-gray-500 mt-2">
        100% Secure Payment Processing
      </p>
    </div>
  </motion.div>
</div>
  );
}

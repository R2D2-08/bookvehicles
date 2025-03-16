const express = require("express");
const { authenticate } = require("../middleware/auth");
const Review = require("../models/Reviews");
const Ride = require("../models/Rides");

const router = express.Router();

router.post("/driver", authenticate, async (req, res) => {
  try {
    const { ride_id, driver_id, rating, review_text } = req.body;
    const passenger_id = req.user.id;

    if (!ride_id || !driver_id || !rating) {
      return res
        .status(400)
        .json({ error: "Ride ID, Driver ID, and rating are required." });
    }

    const ride = await Ride.findOne({
      where: { ride_id, passenger_id, driver_id, status: "completed" },
    });
    if (!ride) {
      return res
        .status(400)
        .json({ error: "Review can only be given for a completed ride." });
    }

    const existingReview = await Review.findOne({
      where: { ride_id, reviewer_id: passenger_id },
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this ride." });
    }

    const review = await Review.create({
      ride_id,
      reviewer_id: passenger_id,
      reviewee_id: driver_id,
      rating,
      review_text,
      review_type: "driver",
    });

    const avgRating = await Review.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
      ],
      where: { reviewee_id: driver_id, review_type: "driver" },
      raw: true,
    });

    await User.update(
      { rating: avgRating.avg_rating || 0 },
      { where: { id: driver_id } }
    );

    return res
      .status(201)
      .json({ message: "Review submitted successfully", review });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to submit review", details: error.message });
  }
});

router.post("/passenger", authenticate, async (req, res) => {
  try {
    const { ride_id, passenger_id, rating, review_text } = req.body;
    const driver_id = req.user.id;

    if (!ride_id || !passenger_id || !rating) {
      return res
        .status(400)
        .json({ error: "Ride ID, Passenger ID, and rating are required." });
    }

    const ride = await Ride.findOne({
      where: { ride_id, passenger_id, driver_id, status: "completed" },
    });
    if (!ride) {
      return res
        .status(400)
        .json({ error: "Review can only be given for a completed ride." });
    }

    const existingReview = await Review.findOne({
      where: { ride_id, reviewer_id: driver_id },
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this ride." });
    }

    const review = await Review.create({
      ride_id,
      reviewer_id: driver_id,
      reviewee_id: passenger_id,
      rating,
      review_text,
      review_type: "passenger",
    });

    const avgRating = await Review.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
      ],
      where: { reviewee_id: passenger_id, review_type: "passenger" },
      raw: true,
    });

    await User.update(
      { rating: avgRating.avg_rating || 0 },
      { where: { id: passenger_id } }
    );

    return res
      .status(201)
      .json({ message: "Review submitted successfully", review });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to submit review", details: error.message });
  }
});

router.get("/driver/:driver_id", async (req, res) => {
  try {
    const { driver_id } = req.params;
    const reviews = await Review.findAll({
      where: { reviewee_id: driver_id, review_type: "driver" },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name", "photo_url"],
        },
      ],
    });
    return res.status(200).json({ reviews });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: error.message });
  }
});

router.get("/passenger/:passenger_id", async (req, res) => {
  try {
    const { passenger_id } = req.params;
    const reviews = await Review.findAll({
      where: { reviewee_id: passenger_id, review_type: "passenger" },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name", "photo_url"],
        },
      ],
    });
    return res.status(200).json({ reviews });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: error.message });
  }
});

module.exports = router;

const express = require("express");
const Ride = require("../models/Rides");
const { authenticate, authorize } = require("../middleware/auth");
const Driver = require("../models/Drivers");
const Vehicle = require("../models/Vehicles");
const Passenger = require("../models/Passengers");
const router = express.Router();

router.post("/request", authenticate, async (req, res) => {
  try {
    const {
      start_location_id,
      end_location_id,
      fare,
      distance,
      vehicle_requested,
    } = req.body;
    const passenger_id = req.user.id;

    if (
      !start_location_id ||
      !end_location_id ||
      !fare ||
      !distance ||
      !vehicle_requested
    ) {
      return res.status(422).json({ error: "All fields are required." });
    }

    const ride = await Ride.create({
      passenger_id,
      start_location_id,
      end_location_id,
      fare,
      distance,
      status: "pending",
      vehicle_requested,
    });

    return res
      .status(201)
      .json({ message: "Ride requested successfully", ride });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to request ride", details: error.message });
  }
});

router.post(
  "/accept/:ride_id",
  authenticate,
  authorize(["driver"]),
  async (req, res) => {
    try {
      const { ride_id } = req.params;
      const driver_id = req.user.id;

      const driver = await Driver.findOne({ where: { user_id: driver_id } });
      if (!driver) {
        return res
          .status(403)
          .json({ error: "Only registered drivers can accept rides." });
      }
      const ride = await Ride.findOne({
        where: { ride_id, status: "pending" },
      });
      if (!ride) {
        return res
          .status(404)
          .json({ error: "Ride not found or already accepted." });
      }
      const vehicle = await Vehicle.findOne({
        where: { id: driver.vehicle_id },
      });
      if (vehicle.type !== ride.vehicle_requested) {
        return res.status(403).json({
          error: "Driver's vehicle is not suitable for this ride.",
        });
      }

      if (!ride) {
        return res
          .status(404)
          .json({ error: "Ride not found or already accepted." });
      }
      ride.driver_id = driver_id;
      ride.status = "accepted";
      await ride.save();

      return res
        .status(200)
        .json({ message: "Ride accepted successfully", ride });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to accept ride", details: error.message });
    }
  }
);

router.get("/list", authenticate, async (req, res) => {
  try {
    const rides = await Ride.findAll({ where: { passenger_id: req.user.id } });
    return res.status(200).json({ rides });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch rides", details: error.message });
  }
});

router.get(
  "/driver/list",
  authenticate,
  authorize(["driver"]),
  async (req, res) => {
    try {
      const rides = await Ride.findAll({ where: { driver_id: req.user.id } });
      return res.status(200).json({ rides });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to fetch rides", details: error.message });
    }
  }
);

router.get("/details/passenger/:ride_id", authenticate, async (req, res) => {
  try {
    const { ride_id } = req.params;
    const ride = await Ride.findOne({ where: { ride_id } });
    const driver = await Driver.findOne({ where: { user_id: ride.driver_id } });
    const vehicle = await Vehicle.findOne({ where: { id: driver.vehicle_id } });
    return res.status(200).json({ ride, driver, vehicle });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch ride details", details: error.message });
  }
});

router.get("/details/driver/:ride_id", authenticate, async (req, res) => {
  try {
    const { ride_id } = req.params;
    const ride = await Ride.findOne({ where: { ride_id } });
    const passenger = await Passenger.findOne({
      where: { user_id: ride.passenger_id },
    });
    return res.status(200).json({ ride, passenger });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch ride details", details: error.message });
  }
});

module.exports = router;

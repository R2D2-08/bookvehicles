const express = require("express");

const reviewRoutes = require("./review");
const rideRoutes = require("./ride");
const userRoutes = require("./user");

const router = express.Router();

router.use("/reviews", reviewRoutes);
router.use("/rides", rideRoutes);
router.use("/users", userRoutes);

module.exports = router;

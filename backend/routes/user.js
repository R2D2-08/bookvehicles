const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Ride = require("../models/Rides");
const Payment = require("../models/Payment");
const Passenger = require("../models/Passengers");
const Driver = require("../models/Drivers");
const Vehicle = require("../models/Vehicles");
const Location = require("../models/Locations");
const Review = require("../models/Reviews");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { serialize } = require("v8");
const { doesNotMatch } = require("assert");
const { authenticate, authorize } = require("../middleware/auth");
const { decode } = require("punycode");
const { where, Sequelize } = require("sequelize");
const qs = require('qs')
const uploadDir = path.join(__dirname, "../uploads");
const pool = require("../db");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.c === "production",
  sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

router.post(
  "/register",
  upload.fields([
    {
      name: "photo_url",
      maxCount: 1,
    },
    {
      name: "image_url",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone_no,
        role,
        license_no,
        vehicle_no,
        type,
        capacity,
        model,
      } = req.body;
      console.log(req.body, "checking out router.post(/register)");
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser)
        return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const photo_url = req.files["photo_url"]
        ? `/uploads/${req.files["photo_url"][0].filename}`
        : null;
      const image_url = req.files["image_url"]
        ? `/uploads/${req.files["image_url"][0].filename}`
        : null;
      console.log("Photo URL: " + photo_url);
      console.log("Image URL: " + image_url);
      const newUser = await User.create({
        name,
        email,
        phone_no,
        password: hashedPassword,
        role: role || "user",
        photo_url,
      });

      if (role === "driver") {
        if (!license_no || !vehicle_no) {
          return res.status(400).json({
            error: "Drivers must provide license number and vehicle details",
          });
        }

        const newVehicle = await Vehicle.create({
          vehicle_no: vehicle_no,
          type: type,
          capacity: capacity,
          model: model,
          image_url,
        });

        await Driver.create({
          user_id: newUser.id,
          license_no,
          vehicle_id: newVehicle.id,
        });
        await Passenger.create({
          user_id: newUser.id,
        });
      } else {
        await Passenger.create({
          user_id: newUser.id,
        });
      }

      const { accessToken, refreshToken } = generateTokens(newUser);
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err) {
      console.error("Registration Error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

router.post("/get-points", async (req, res) => {
  try {
    const {userId} = req.body;
    console.log(userId);
    if(!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const user = await Passenger.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ points: user.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid Credentials" });

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", email, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid Token" });
    }
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.json({ accessToken: newAccessToken });
  });
});

router.get(
  "/passengers",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const users = await User.findAll({
        where: { role: "user" },
        attributes: [
          "id",
          "name",
          "role",
          "photo_url",
          "phone_no",
          "email",
          "rating",
          "location_id",
          "createdAt",
        ],
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/drivers", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "driver" },
      attributes: [
        "role",
        "id",
        "name",
        "phone_no",
        "email",
        "rating",
        "createdAt",
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const stats = {
      drivers: await User.count({ where: { role: "driver" } }),
      users: await User.count({ where: { role: "user" } }),
      rides: await Ride.count(),
      revenue: await Payment.sum("amount"),
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/rides", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const rides = await Ride.findAll({
      attributes: ["ride_id", "driver_id", "passenger_id", "fare"],
      include: [
        {
          model: Location,
          as: "startLocation",
          attributes: ["address"],
        },
        {
          model: Location,
          as: "endLocation",
          attributes: ["address"],
        },
      ],
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/payments",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const payments = await Payment.findAll({
        attributes: ["transaction_id", "amount", "payment_status"],
      });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post("/reviews", async (req, res) => {
  try {
    const {
      ride_id,
      reviewer_id,
      reviewee_id,
      rating,
      review_text,
      review_type,
    } = req.body;
    console.log(req.body);
    if (!ride_id || !reviewer_id || !reviewee_id || !rating || !review_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const review = await Review.create({
      ride_id,
      reviewer_id,
      reviewee_id,
      rating,
      review_text,
      review_type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Review posted successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-payment", async (req, res) => {
  try {
    console.log("Received body:", req.body);
    let { transaction_id, amount, payment_status, userId } = req.body;

    // Ensure transaction_id is a string
    transaction_id = String(transaction_id);

    // Validate input
    if (!transaction_id || !amount || payment_status === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure amount is a decimal
    amount = parseFloat(amount) / 100;

    // Insert or update the payment
    const paymentRes = await Payment.create({
      transaction_id,
      amount,
      payment_status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const incrementedPoints = Math.ceil(amount / 100);

    const rewardRes = await Passenger.update(
      { points: Sequelize.literal(`points + ${incrementedPoints}`)},
      { where: { user_id: userId } }
    );
    

    res.json({ success: true, message: "Payment updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Loggged Out" });
});

router.get("/check-auth", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    try {
      const newAccessToken = await refreshAccessToken(req.cookies.refreshToken);
      if (!newAccessToken) {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
      res.cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
      console.log("New Access Token:", newAccessToken);

      const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
      return res
        .status(200)
        .json({ isAuthenticated: true, role: decoded.role });
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log(decoded);
    return res.status(200).json({ isAuthenticated: true, role: decoded.role });
  } catch (error) {
    if (error.name === "TokenExpiredError" && req.cookies.refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(
          req.cookies.refreshToken
        );
        if (!newAccessToken) {
          return res.status(401).json({ message: "Authentication failed" });
        }
        res.cookie("accessToken", newAccessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000,
        });
        const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
        return res
          .status(200)
          .json({ isAuthenticated: true, role: decoded.role });
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
});

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    return null;
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );

    console.log("Decoded Refresh Token:", decodedRefreshToken);

    const { id, role, name } = decodedRefreshToken;

    if (!id || !role || !name) {
      console.error("Missing fields in refresh token");
      return null;
    }

    const payload = { id: id, role, name };
    console.log("Payload for new access token:", payload);

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    console.log("New Access Token:", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    return null;
  }
};

router.get("/details", async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          error: "No refresh token",
        });
      }

      const newAccessToken = refreshAccessToken(refreshToken);
      res.cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({
        isAuthenticated: true,
      });
    }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    res.status(200).json({
      name: decoded.name,
      role: decoded.role,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.get("/profile", authenticate, async (req, res) => {
  try {
    console.log(req.user || req.cookies);
    const user = await User.findOne({ where: { id: req.user.id } });
    if (req.user.role === "driver") {
      const driver = await Driver.findOne({ where: { user_id: req.user.id } });
      const vehicle = await Vehicle.findOne({
        where: { id: driver.vehicle_id },
      });
      return res.status(200).json({ user, driver, vehicle });
    } else {
      const passenger = await Passenger.findOne({
        where: { user_id: req.user.id },
      });
      return res.status(200).json({ user, passenger });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get("/id", authenticate, async (req, res) => {
  try {
    console.log(req.user || req.cookies);
    return res.status(200).json({ id: req.user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Passenger = require("../models/Passengers");
const Driver = require("../models/Drivers");
const Vehicle = require("../models/Vehicles");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { serialize } = require("v8");
const { doesNotMatch } = require("assert");
const uploadDir = path.join(__dirname, "../uploads");
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
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, password, phone_no, role, license_no, vehicle } =
      req.body;
    console.log(req.body);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const newUser = await User.create({
      name,
      email,
      phone_no,
      password: hashedPassword,
      role: role || "user",
      photo_url,
    });

    if (role === "driver") {
      if (!license_no || !vehicle) {
        return res.status(400).json({
          error: "Drivers must provide license number and vehicle details",
        });
      }

      const newVehicle = await Vehicle.create({
        vehicle_no: vehicle.vehicle_no,
        type: vehicle.type,
        capacity: vehicle.capacity,
        model: vehicle.model,
        image_url: vehicle.image_url || null,
      });

      await Driver.create({
        user_id: newUser.id,
        license_no,
        vehicle_id: newVehicle.id,
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
});

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

    res.status(200).json({ message: "Login successful" });
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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.json({ accessToken: newAccessToken });
  });
});

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    return res.status(401).json({
      message: "No access token",
    });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log(decoded);

    return res.status(200).json({
      isAuthenticated: true,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      try {
        const newAccessToken = await refreshAccessToken(
          req.cookies.refreshToken
        );

        res.setHeader(
          "Set-Cookie",
          serialize("accessToken", newAccessToken, cookieOptions)
        );

        res.status(200).json({
          isAuthenticated: true,
        });
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
    }
  }
});

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
  const decodedRefreshToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET
  );

  const newAccessToken = jwt.sign(
    {
      userId: decodedRefreshToken.userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return newAccessToken;
};

module.exports = router;

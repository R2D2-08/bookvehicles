require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize, syncDatabase, User } = require("./models");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const http = require("http");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const path = require("path");
const Ride = require("./models/Rides");
const Location = require("./models/Locations");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const adminRoutes = require("./routes/user");
const Driver = require("./models/Drivers");
const Vehicle = require("./models/Vehicles");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

const activeDrivers = {};
const driverLocations = {};
const booking_requests = {};
const driverDeails = {};

io.on("connection", (socket) => {
  // Parse cookies to extract the access token
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const accessToken = cookies.accessToken;
  console.log("Access Token:", accessToken);
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);
      socket.userId = decoded.id;
      console.log(`User connected with ID: ${socket.userId}`);
    } catch (err) {
      console.log("Invalid or expired access token");
    }
  }

  // Register driver
  socket.on("driver_register", async () => {
    const driverId = socket.userId;
    if (!driverId) return; // Prevent unnecessary DB queries

    try {
      const driver = await Driver.findOne({ where: { user_id: driverId } });
      const vehicle = await Vehicle.findOne({
        where: { id: driver.vehicle_id },
      });
      driverDeails[socket.id] = { driver, vehicle };
      activeDrivers[socket.id] = socket;
      console.log(`Driver ${socket.id} connected`);
    } catch (error) {
      console.error("Error fetching driver details:", error);
    }
  });

  // Update driver location
  socket.on("update_location", ({ latitude, longitude }) => {
    driverLocations[socket.id] = { latitude, longitude };
    console.log(`Driver ${socket.id} updated location: `, latitude, longitude);

    Object.keys(booking_requests).forEach((requestId) => {
      const request = booking_requests[requestId];
      if (request.accepted && request.driverId === socket.id) {
        const riderSocket = findRiderSocket(request.riderUserId);
        if (riderSocket) {
          riderSocket.emit("driver_location_update", { latitude, longitude });
        }
      }
    });
  });

  // Rider requests a ride
  socket.on("book_request", async (data) => {
    console.log("New ride request: ", data);
    const requestId = `ride_${Date.now()}`;
    const vehicleTypes = ["premium", "standard", "auto", "bike"];

    try {
      const newPickupLocation = await Location.create({
        coordinates: {
          type: "Point",
          coordinates: [data.pickCoordinates[0], data.pickCoordinates[1]],
        },
        address: data.pickLoc,
      });

      const newDropoffLocation = await Location.create({
        coordinates: {
          type: "Point",
          coordinates: [data.dropCoordinates[0], data.dropCoordinates[1]],
        },
        address: data.dropLoc,
      });

      const newRide = await Ride.create({
        driver_id: null,
        passenger_id: data.id,
        start_location_id: newPickupLocation.id,
        end_location_id: newDropoffLocation.id,
        fare: data.price,
        booking_date: data.booking_date,
        status: "pending",
        vehicle_requested: vehicleTypes[data.rideType],
        distance: data.distance,
      });

      console.log("Ride created successfully:", newRide);
      booking_requests[requestId] = {
        rideId: newRide.ride_id,
        riderUserId: socket.userId,
        data,
        accepted: false,
        driverId: null,
      };

      console.log("Booking requests: ", booking_requests);

      Object.values(activeDrivers).forEach((driverSocket) => {
        if (
          driverDeails[driverSocket.id].vehicle.type ===
          vehicleTypes[data.rideType]
        ) {
          driverSocket.emit("new_ride_request", { requestId, data });
        }
      });
    } catch (error) {
      console.error("Error creating ride:", error);
    }
  });

  socket.on("driver_location", async ({ driverId, lat, lng }) => {
    console.log(`Driver ${driverId} location: ${lat}, ${lng}`);

    try {
      // Find the driver
      const driver = await User.findOne({ where: { id: driverId } });

      if (!driver) {
        console.error(`Driver ${driverId} not found`);
        return;
      }

      if (!driver.location_id) {
        // Create new location if it doesn't exist
        const newLocation = await Location.create({
          coordinates: {
            type: "Point",
            coordinates: [lat, lng],
          },
        });

        driver.location_id = newLocation.id;
        await driver.save(); // Ensure the driver record is updated
      } else {
        const location = await Location.findOne({
          where: { id: driver.location_id },
        });

        if (location) {
          location.coordinates = {
            type: "Point",
            coordinates: [lat, lng],
          };
          await location.save();
        } else {
          console.error(`Location ${driver.location} not found`);
        }
      }

      const rideRequest = Object.values(booking_requests).find(
        (req) => req.accepted && req.driverId === driverId
      );

      if (rideRequest) {
        const riderSocket = findRiderSocket(rideRequest.riderUserId);
        if (riderSocket) {
          riderSocket.emit("driver_location_update", { lat, lng });
        }
      }
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  });

  // Driver accepts a ride
  socket.on("accept_ride", ({ requestId, driverId }) => {
    console.log(`Driver ${driverId} accepted ride ${requestId}`);

    if (booking_requests[requestId] && !booking_requests[requestId].accepted) {
      booking_requests[requestId].accepted = true;
      booking_requests[requestId].driverId = driverId;

      const riderSocket = findRiderSocket(
        booking_requests[requestId].riderUserId
      );
      console.log("Found Rider Socket:", riderSocket?.id);

      if (riderSocket) {
        riderSocket.emit("ride_accepted", {
          driverId,
          requestId,
        });

        if (driverLocations[driverId]) {
          riderSocket.emit("driver_location_update", driverLocations[driverId]);
        }
      }

      // Notify other drivers that this ride is taken
      Object.values(activeDrivers).forEach((driverSocket) => {
        if (driverSocket.id !== driverId) {
          driverSocket.emit("ride_taken", requestId);
        }
      });

      const updatedRide = Ride.update(
        { driver_id: driverId, status: "accepted" },
        { where: { ride_id: booking_requests[requestId].rideId } }
      );
    }

    console.log(`Ride ${requestId} accepted by Driver ${driverId}`);
  });

  // Handle rider reconnection
  socket.on("reconnect_rider", () => {
    if (!socket.userId) return;

    console.log(`Rider ${socket.userId} reconnected`);

    const rideRequest = Object.values(booking_requests).find(
      (req) => req.riderUserId === socket.userId && req.accepted
    );

    if (rideRequest) {
      socket.emit("ride_accepted", {
        driverId: rideRequest.driverId,
        requestId: rideRequest.requestId,
      });

      if (driverLocations[rideRequest.driverId]) {
        socket.emit(
          "driver_location_update",
          driverLocations[rideRequest.driverId]
        );
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    delete activeDrivers[socket.id];
    delete driverLocations[socket.id];
  });
});

// Helper function to find a rider's active socket
function findRiderSocket(riderUserId) {
  return [...io.sockets.sockets.values()].find((s) => s.userId === riderUserId);
}

app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

const startServer = async () => {
  try {
    await syncDatabase();
    console.log("All tables synced successfully");

    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await sequelize.close();
      server.close(() => {
        console.log("Server shut down gracefully.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("Received termination signal. Closing server...");
      await sequelize.close();
      server.close(() => {
        console.log("Server shut down due to termination signal.");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

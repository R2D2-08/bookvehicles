require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize, syncDatabase } = require("./models");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const http = require("http");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

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

const PORT = process.env.PORT || 5000;

const activeDrivers = {};
const driverLocations = {};
const booking_requests = {};

io.on("connection", (socket) => {
  // Parse cookies to extract the access token
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const accessToken = cookies.Accesstoken; // Adjust cookie name if needed

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, "your_secret_key"); // Replace with your actual secret key
      const userId = decoded.userId; // Extract userId from token
      console.log(`User connected with ID: ${userId}`);
      socket.userId = userId; // Store user ID in the socket
    } catch (err) {
      console.log("Invalid or expired access token");
    }
  }

  // Register driver
  socket.on("driver_register", () => {
    activeDrivers[socket.id] = socket;
    console.log(`Driver ${socket.id} connected`);
  });

  // Update driver location
  socket.on("update_location", ({ latitude, longitude }) => {
    driverLocations[socket.id] = { latitude, longitude };

    console.log(`Driver ${socket.id} updated location: `, latitude, longitude);

    Object.keys(booking_requests).forEach((requestId) => {
      if (
        booking_requests[requestId].accepted &&
        booking_requests[requestId].driverId === socket.id
      ) {
        const riderUserId = booking_requests[requestId].riderUserId;
        const riderSocket = [...io.sockets.sockets.values()].find(
          (s) => s.userId === riderUserId
        );

        if (riderSocket) {
          riderSocket.emit("driver_location_update", { latitude, longitude });
        }
      }
    });
  });

  // Rider requests a ride
  socket.on("book_request", (data) => {
    console.log("New ride request: ", data);

    const requestId = `ride_${Date.now()}`;

    booking_requests[requestId] = {
      riderUserId: socket.userId, // Store userId instead of socket.id
      riderSocketId: socket.id, // Still store socket.id initially
      data,
      accepted: false,
      driverId: null,
    };

    console.log("Booking requests: ", booking_requests);

    Object.values(activeDrivers).forEach((driverSocket) => {
      driverSocket.emit("new_ride_request", { requestId, data });
    });
  });

  // Driver sends location update
  socket.on("driver_location", ({ driverId, lat, lng }) => {
    console.log(`Driver ${driverId} location: ${lat}, ${lng}`);

    const rideRequest = Object.values(booking_requests).find(
      (req) => req.accepted && req.driverId === driverId
    );

    if (rideRequest) {
      const riderSocket = [...io.sockets.sockets.values()].find(
        (s) => s.userId === rideRequest.riderUserId
      );

      if (riderSocket) {
        riderSocket.emit("driver_location_update", { lat, lng });
      }
    }
  });

  socket.on("accept_ride", ({ requestId, driverId }) => {
    console.log(`Driver ${driverId} accepted ride ${requestId}`);

    if (booking_requests[requestId] && !booking_requests[requestId].accepted) {
      booking_requests[requestId].accepted = true;
      booking_requests[requestId].driverId = driverId;

      const riderUserId = booking_requests[requestId].riderUserId;

      // Find the latest socket ID for this user
      const riderSocket = [...io.sockets.sockets.values()].find(
        (s) => s.userId === riderUserId
      );

      console.log("Booking requests: ", booking_requests);
      console.log("Rider socket: ", riderSocket);

      if (riderSocket) {
        console.log("Rider socket found");
        riderSocket.emit("ride_accepted", {
          driverId,
          requestId,
        });

        if (driverLocations[driverId]) {
          riderSocket.emit("driver_location_update", driverLocations[driverId]);
        }
      }

      Object.values(activeDrivers).forEach((driverSocket) => {
        if (driverSocket.id !== driverId) {
          driverSocket.emit("ride_taken", requestId);
        }
      });
    }

    console.log(`Ride ${requestId} accepted by Driver ${driverId}`);
  });

  // Handle rider reconnection and restore ride status
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

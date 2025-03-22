require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize, syncDatabase } = require("./models");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const http = require("http");

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

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

let activeDrivers = {};
let booking_requests = {};

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("driver_register", () => {
    activeDrivers[socket.id] = socket;
    console.log(`Driver ${socket.id} connected`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    delete activeDrivers[socket.id];
  });

  socket.on("book_request", (data) => {
    console.log("New ride request: ", data);

    const requestId = `ride_${Date.now()}`;

    booking_requests[requestId] = {
      rider: socket.id,
      data,
      accepted: false,
    };

    Object.values(activeDrivers).forEach((driverSocket) => {
      driverSocket.emit("new_ride_request", { requestId, data});
    });
  });
  
  socket.on("driver_location", ({ driverId, lat, lng }) => {
    console.log(`Driver ${driverId} location: ${lat}, ${lng}`);

    // Find the rider who booked the ride
    const rideRequest = Object.values(booking_requests).find(
      (req) => req.accepted && req.rider
    );

    if (rideRequest) {
      const riderSocket = io.sockets.sockets.get(rideRequest.rider);
      if (riderSocket) {
        riderSocket.emit("driver_location_update", { lat, lng });
      }
    }
  });

  socket.on("accept_ride", ({ requestId, driverId }) => {
    if (booking_requests[requestId] && !booking_requests[requestId].accepted) {
      booking_requests[requestId].accepted = true;
      const riderSocketId = booking_requests[requestId].rider;
      const riderSocket = io.sockets.sockets.get(riderSocketId);

      if (riderSocket) {
        riderSocket.emit("ride_accepted", {
          driverId,
          requestId,
        });
      }

      Object.values(activeDrivers).forEach((driverSocket) => {
        if (driverSocket.id !== driverId) {
          driverSocket.emit("ride_taken", requestId);
        }
      });
    }

    console.log(`Ride ${requestId} accepted by Driver ${driverId}`);
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

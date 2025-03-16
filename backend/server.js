require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection, sequelize } = require("./config/database");
const userRouter = require("./routes/User");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

// Attach io to rideRouter
const rideRouter = require("./routes/rideRoutes")(io);
app.use("/rides", rideRouter);
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

// Store active drivers and passengers
const drivers = {};
const passengers = {};

// WebSocket logic for ride matching and real-time tracking
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Passenger sends ride request
  socket.on("requestRide", (rideDetails) => {
    console.log("New ride request:", rideDetails);

    // Store passenger's socket
    passengers[socket.id] = { socket, rideDetails };

    // Broadcast request to all drivers
    io.emit("newRideRequest", { rideDetails, passengerId: socket.id });
  });

  // Driver accepts or rejects ride
  socket.on("respondToRide", ({ passengerId, driverId, accepted }) => {
    if (accepted) {
      console.log(`Driver ${driverId} accepted the ride for passenger ${passengerId}`);

      // Store assigned driver
      drivers[driverId] = { socket, passengerId };

      // Notify passenger
      io.to(passengerId).emit("rideAccepted", { driverId });
    } else {
      console.log(`Driver ${driverId} rejected the ride for passenger ${passengerId}`);
      io.to(passengerId).emit("rideRejected", { driverId });
    }
  });

  // Real-time location tracking
  socket.on("updateLocation", ({ userId, location }) => {
    if (drivers[userId]) {
      // Driver updates location, send to assigned passenger
      const passengerId = drivers[userId].passengerId;
      io.to(passengerId).emit("driverLocation", location);
    } else if (passengers[userId]) {
      // Passenger updates location, send to assigned driver
      const driverId = Object.keys(drivers).find(d => drivers[d].passengerId === userId);
      if (driverId) io.to(driverId).emit("passengerLocation", location);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete drivers[socket.id];
    delete passengers[socket.id];
  });
});

const startServer = async () => {
  testConnection();
  await sequelize.sync();
  console.log("All tables synced successfully");

  try {
    server.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server: ", err);
    process.exit(1);
  }
};

startServer();

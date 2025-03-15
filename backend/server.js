require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize, syncDatabase } = require("./models"); // Import from index.js

// Import routes
const userRouter = require("./routes/User");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

// API Routes
app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

// Start server
const startServer = async () => {
  try {
    await syncDatabase(); // Sync all models from index.js
    console.log("All tables synced successfully");

    const server = app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });

    // Graceful Shutdown Handling
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

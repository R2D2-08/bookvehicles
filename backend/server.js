require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection, sequelize } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

const startServer = async () => {
  testConnection();
  await sequelize.sync({ alter: true });
  console.log("All tables synced successfully");
  try {
    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    })
  } catch (err) {
    console.error("Failed to start server: ", err);
    process.exit(1);
  }
};

startServer();

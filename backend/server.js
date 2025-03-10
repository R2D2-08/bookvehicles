require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection, sequelize } = require("./config/database");
const userRouter = require("./routes/User");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.send("Taxi Booking API is running...");
});

const startServer = async () => {
  testConnection();
  await sequelize.sync();
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
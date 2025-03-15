const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./Users");
const Driver = require("./Drivers");
const Passenger = require("./Passengers");
const Vehicle = require("./Vehicles");
const Review = require("./Reviews");
const Payment = require("./Payment");
const Location = require("./Locations");
const Ride = require("./Rides");

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Driver,
  Passenger,
  Vehicle,
  Review,
  Payment,
  Location,
  Ride,
};

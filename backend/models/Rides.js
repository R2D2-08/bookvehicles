const { sequelize } = require("../config/database");
const { DataTypes, DatabaseError } = require("sequelize");
const Driver = require("./Drivers");
const Passenger = require("./Passengers");
const Location = require("./Locations");
const Payment = require("./Payment");

const Ride = sequelize.define(
  "Ride",
  {
    ride_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Drivers",
        key: "user_id",
      },
    },
    passenger_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Passengers",
        key: "user_id",
      },
    },
    start_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Locations",
        key: "id",
      },
    },
    end_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Locations",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "started", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
    fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "PaymentS",
        key: "transaction_id",
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vehicle_requested: {
      type: DataTypes.ENUM("premium", "standard", "auto", "bike"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Driver.hasMany(Ride, { foreignKey: "driver_id", onDelete: "CASCADE" });
Ride.belongsTo(Driver, { foreignKey: "driver_id" });

Passenger.hasMany(Ride, { foreignKey: "passenger_id", onDelete: "CASCADE" });
Ride.belongsTo(Passenger, { foreignKey: "passenger_id" });

Location.hasOne(Ride, { foreignKey: "start_location_id" });
Ride.belongsTo(Location, { foreignKey: "start_location_id" });

Location.hasOne(Ride, { foreignKey: "end_location_id" });
Ride.belongsTo(Location, { foreignKey: "end_location_id" });

Payment.hasOne(Ride, { foreignKey: "payment_id", onDelete: "SET NULL" });
Ride.belongsTo(Payment, { foreignKey: "payment_id" });

module.exports = Ride;

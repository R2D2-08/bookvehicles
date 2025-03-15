const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./Users");
const Vehicle = require("./Vehicles");

const Driver = sequelize.define(
  "Driver",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    license_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "Vehicles",
        key: "id",
      },
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    validate: {
      async photoRequiredForDriver() {
        const user = await User.findByPk(this.user_id);
        if (user && user.role === "driver" && !user.photo_url) {
          throw new Error("Drivers must have a photo.");
        }
      },
    },
  }
);

Vehicle.hasOne(Driver, { foreignKey: "vehicle_id", onDelete: "CASCADE" });
Driver.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

User.hasOne(Driver, { foreignKey: "user_id", onDelete: "CASCADE" });
Driver.belongsTo(User, { foreignKey: "user_id" });

module.exports = Driver;

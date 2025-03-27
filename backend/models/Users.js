const { DataTypes, DatabaseError } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");
const Location = require("./Locations");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 20],
      },
    },
    phone_no: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      validate: {
        len: [10, 10],
        isNumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "driver"),
      allowNull: false,
      defaultValue: "user",
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    timestamps: true,
  }
);

Location.hasOne(User, { foreignKey: "location_id", onDelete: "SET NULL" });
User.belongsTo(Location, { foreignKey: "location_id" });

module.exports = User;

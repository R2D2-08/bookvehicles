const { DataTypes, DatabaseError } = require("sequelize");
const { sequelize } = require("../config/database");

const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coordinates: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Location;

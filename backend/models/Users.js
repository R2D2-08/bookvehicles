const { DataTypes, DatabaseError } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require('bcryptjs');

// need some changes
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
      unique: true,
      validate: {
        isEmail: true,
      },
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
      defaultValue: "user"
    }
  },
);

module.exports = User;
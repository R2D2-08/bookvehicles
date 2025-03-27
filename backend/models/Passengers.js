const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./Users");

const Passenger = sequelize.define(
  "Passenger",
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
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

User.hasOne(Passenger, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Passenger.belongsTo(User, {
  foreignKey: "user_id",
});

module.exports = Passenger;

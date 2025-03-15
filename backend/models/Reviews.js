const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./Users");
const Ride = require("./Rides");

const Review = sequelize.define(
  "Review",
  {
    review_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ride_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Rides",
        key: "ride_id",
      },
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    reviewee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_type: {
      type: DataTypes.ENUM("driver", "passenger"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

User.hasMany(Review, {
  foreignKey: "reviewer_id",
  as: "given_reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

User.hasMany(Review, {
  foreignKey: "reviewee_id",
  as: "received_reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(User, { foreignKey: "reviewee_id", as: "reviewee" });

Ride.hasMany(Review, { foreignKey: "ride_id", onDelete: "CASCADE" });
Review.belongsTo(Ride, { foreignKey: "ride_id" });

module.exports = Review;

const { Sequelize } = require("sequelize");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    port: 22218,
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: console.log,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MYSQL");
  } catch (error) {
    console.error(`Unable to connect to MYSQL - ${error}`);
  }
};

module.exports = { testConnection, sequelize };

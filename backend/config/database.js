const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME, 
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD, {
        host: process.env.DATABASE_HOST,
        dialect: "mysql"
    }
); 

const testConnection = async() => {
    try {
        await sequelize.authenticate();
        console.log("Connected to MYSQL");
    } catch(error) {
        console.error(`Unable to connect to MYSQL - ${error}`);
    }
}

module.exports = {testConnection, sequelize};
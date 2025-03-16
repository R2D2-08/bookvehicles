const express = require("express");
const router = express.Router();

module.exports = (io) => {
  router.get("/", (req, res) => {
    res.send("Ride API is running...");
  });

  return router;
};

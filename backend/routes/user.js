const express = require("express");
const User = require("../models/Users");

const router = express.Router();

router.post("/register", async (req, res) => {
    const {name, phone_no, email,password} = req.body;
    try {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});

router.get("/", async(req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch(err) {
        res.status(500).json({error: err.message})
    }
});

module.exports = router;
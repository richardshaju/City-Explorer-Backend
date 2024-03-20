const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helper = require('./helper.js')

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/city_explorer", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Define MongoDB schema and model
const userSchema = new mongoose.Schema({
  email: String,
  city: String,
  preferences: {
    type: [String],
    default: [],
  },
});
const User = mongoose.model("User", userSchema);

// API endpoint for fetching weather data
app.get("/weather/:city", async (req, res) => {
  try {
    const result = await helper.cityWeather(req.params.city)
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/user/:lat&:log", async (req, res) => {
  // Lattitude and logitude of the user's position is passed from the frontend
  const coordinates = {
    latitude : req.params.lat,
    longitude : req.params.log,
  }

  try {
    const weather = await helper.userWeather(coordinates)
    const nearby = await helper.nearByPlaces(coordinates)

    const data = {
      user_weather: weather,
      nearby: nearby
    }
    console.log(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/register", async (req, res) => {
  try {
    const { email, city, preferences } = req.body;
    const newUser = new User({ email, city, preferences });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port"+ PORT);
});

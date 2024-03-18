const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { cityWeather } = require("./helper");

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
    const result = cityWeather(req.params.city)
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/user/:lat&:log", async (req, res) => {
  // Lattitude and logitude of the user's position is passed from the frontend
  const weatherData = {
    weather: {},
    details: {},
  };
  try {
    const latitude = req.params.lat;
    const longitude = req.params.log;
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=551ef908161a9cc4b399b037d5e00cef`
    );

    // Rearranging data from api to our needs
    weatherData.weather.main = weatherResponse.data.weather[0].main;
    weatherData.weather.description =
      weatherResponse.data.weather[0].description;
    weatherData.weather.temp = weatherResponse.data.main.temp;
    weatherData.weather.feels_like = weatherResponse.data.main.feels_like;
    weatherData.weather.temp_min = weatherResponse.data.main.temp_min;
    weatherData.weather.temp_max = weatherResponse.data.main.temp_max;
    weatherData.weather.pressure = weatherResponse.data.main.pressure;
    weatherData.weather.humidity = weatherResponse.data.main.humidity;
    weatherData.weather.visibility = weatherResponse.data.main.visibility;
    weatherData.weather.wind_speed = weatherResponse.data.main.wind_speed;

    weatherData.details.name = weatherResponse.data.name;
    weatherData.details.country = weatherResponse.data.sys.country;
    weatherData.details.timezone = weatherResponse.data.timezone;


    
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/nearby/:lat&:log', async (req, res) => {
    const latitude = req.params.lat;
    const longitude = req.params.log;
    try {
        const query = `[out:json];(
            node(around:1000,${latitude},${longitude})["amenity"="restaurant"];
            node(around:1000,${latitude},${longitude})["leisure"="park"];
            node(around:1000,${latitude},${longitude})["tourism"];
          );out;`;
          const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const nearbyPlaces = response.data.elements.map(place => ({
            id: place.id,
            type: place.tags.amenity || place.tags.leisure || place.tags.tourism,
            name: place.tags.name || place.tags.tourism,
            coordinates: [place.lon, place.lat]
          }));
      res.json(nearbyPlaces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


app.get("/", async (req, res) => {
  const data = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=10.240298&lon=76.263130&appid=${process.env.PORT}`
  );
  res.send(data.data.main);
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

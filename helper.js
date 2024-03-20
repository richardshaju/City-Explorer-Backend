const axios = require('axios');
require('dotenv').config();


module.exports = {
  cityWeather: async (city) => {
    try {
      const weatherResponse = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`
      );
      const weatherData = weatherResponse.data;
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },
  userWeather: async (coordinates) => {
    const weatherData = {
      weather: {},
      details: {},
    };
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=551ef908161a9cc4b399b037d5e00cef`
      );
  
      // Rearranging data from api to our needs
      weatherData.weather.main = weatherResponse.data.weather[0].main;
      weatherData.weather.description = weatherResponse.data.weather[0].description;
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
  
      return weatherData
    } catch (error) {
      throw error;
    }
  },
  nearByPlaces: async(coordinates) => {
    try {
      const query = `[out:json];(
          node(around:1000,${coordinates.latitude},${coordinates.longitude})["amenity"="restaurant"];
          node(around:1000,${coordinates.latitude},${coordinates.longitude})["leisure"="park"];
          node(around:1000,${coordinates.latitude},${coordinates.longitude})["tourism"];
        );out;`;
        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const nearbyPlaces = response.data.elements.map(place => ({
          id: place.id,
          type: place.tags.amenity || place.tags.leisure || place.tags.tourism,
          name: place.tags.name || place.tags.tourism,
          coordinates: [place.lon, place.lat]
        }));
   return nearbyPlaces
  } catch (error) {
    throw(error)
  }
  }
};

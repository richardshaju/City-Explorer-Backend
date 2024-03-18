export async function cityWeather (city){
        const city = req.params.city;
        const weatherResponse = await axios.get(
          `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`
        );
        const weatherData = weatherResponse.data;
        return weatherData
}
const axios = require('axios').default;
const Weather = require('../model/weather');

async function getWeatherForCity(city) {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const units = 'metric';
    const weatherData = {
        date: Date.now(),
        city,
    }; 

   try {      
       const { data } = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${weatherApiKey}`);       
       
       Object.assign(weatherData, {
           weatherDescription: data.weather.description,
           temperature: data.main.temp,
           wind: { ...data.wind }
       });
       
   }
   catch (e) {
       console.log(e);
   }

   return weatherData;
}

async function getUserWeatherData(userId) {
    let data = null;

    try {
        data = await Weather.find({ userId }, 'date city temperature wind', { sort: { date: 'desc' }});
    }
    catch(e) {
        throw new Error(e.message);
    }

    return data;
}

async function deleteUserWeatherData(userId, weatherId) {
    let success = false;

    try {
        const result = await Weather.findOneAndDelete({ _id: weatherId, userId });
        success = !! result;
    }
    catch(e) {
        console.log(e);
    }

    return success;
}

async function saveWeatherData(userId, weatherData) {
    const weatherModel = new Weather(weatherData);
    weatherModel.set('userId', userId);
    
    let weatherId = null;

    try {
        const result = weatherModel.save();
        weatherId = (await result)._id;
    }
    catch(e) {
        throw new Error(e.message);
    }

    return weatherId;
}

module.exports = {
    getWeatherForCity,
    getUserWeatherData,
    deleteUserWeatherData,
    saveWeatherData,
};
const { authonticate, authorize } = require('../api/users');
const weatherApi = require('../api/weather');
const router = require('express').Router();

router.get('/city/:cityName', authonticate, getWeather);
router.get('/history/:userid', authonticate, authorize('matchedUser','admin'), getUserWeatherHistory);
router.get('/history/delete/:weatherId', authonticate, authorize('matchedUser','admin'), deleteUserWeatherData);

async function getWeather(req, res) {
    const { cityName, currentUserId } = req.params;
    const weatherData = await weatherApi.getWeatherForCity(cityName);

    // no need to wait until the weather-data will be writen to mongo.
    weatherApi.saveWeatherData(currentUserId, weatherData);
    
    res.json(weatherData);
}

async function getUserWeatherHistory(req, res) {
    const { userid } = req.params;
    try {
        const data = await weatherApi.getUserWeatherData(userid);
        res.json(data);
    }
    catch(e) {
        res.status(500).json({error: e.mesage});
    }
}

async function deleteUserWeatherData(req, res) {
    const { currentUserId, weatherId} = req.params;
    try {
        const success = weatherApi.deleteUserWeatherData(currentUserId, weatherId);
        
        if(success) {
            res.json({ success });
        }
        else {
            res.status(404).json({ error: `weather entry with id: ${weatherId} not found for current user.`});
        }
    }
    catch(e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports = router;

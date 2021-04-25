const mongoose = require('mongoose');
const { Schema } = mongoose;

const weatherSchema = new Schema({
    city: { type: String, required: true },
    date: { type: Date, required: true },
    weatherDescription: { type: String },
    temperature: { type: Number },
    wind:  { 
        speed: { type: Number }, 
        deg:  { type: Number }
    },
    userId: { type: mongoose.Types.ObjectId, ref: 'User'}
});

const Weather = mongoose.model('Weather', weatherSchema, 'weather');

module.exports = Weather;
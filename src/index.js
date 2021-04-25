const config = require('./config');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_WEATHER_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', err => {
    console.log(`MongoDB error: ${err}`);
});
db.once('open', err => {
    console.log('MongoDB connected..');
});

const userRouter = require('./routes/users');
const weatherRouter = require('./routes/weather');
const { once } = require('./model/user');
const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/user', userRouter);
app.use('/weather', weatherRouter);

app.listen('3000', () => {
    console.log(`server ready on: http://localhost:3000/`);
});
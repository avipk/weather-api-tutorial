const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailRgx = /^[0-9a-z_\-.]+@[a-z0-9_\-.]+\.[a-z]+$/i;
const roles = [ 'admin', 'user' ];

// Validate email string
const emailValidation = (email) => emailRgx.test(email);

// Validate a role
const roleValidation = (role) => roles.includes(role);

const userSchema = new Schema({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: emailValidation },
    role: { type: String, required: true, validate: roleValidation },    
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;

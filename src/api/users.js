const jwt = require('jsonwebtoken');
const User = require('../model/user');
const e = require('express');

const anonymousUser = Object.freeze({
    role: 'anonymous'
});

const defaultUserProjection = '_id fullName email role';

async function addUser(userData) {    
    const userModel = new User(userData);
    let newUserId = null;
    try {
         result = await userModel.save();
         newUserId = result._id;
    }
    catch(e) {
        console.log(e);
        switch(e.code) {  
            case 11000: // email duplication error (email has a unique constrain)
                throw new Error(`The email '${userData.email}' already exists. Have you forgot your password ?`);
            default:
                throw new Error(`Somting bad happened...`);
        }
    }
           
    return newUserId;
}

async function findById(id) {
    let user = null;
    try {
        user = await User.findById(id, defaultUserProjection);
    }
    catch(e) {
        throw new Error(e.message);
    }
    
    return user;
}

async function findByEmail(email) {  
    let user = null;

    try {
        user = User.find({ email }, defaultUserProjection);
    }
    catch(e) {
        throw new Error(e.message);
    }

    return user;
}

async function updateUser(id, updateData) {
    let success = false;
    try{ 
        const result = await User.findByIdAndUpdate(id, updateData, { new: true });
        success = !! result;
    }
    catch(e) {
        throw new Error(e.message);
    }
    
    // return true on success
    return success;
}

async function removeUser(id) {
    let success = false;
    try{ 
        const result = await User.findByIdAndDelete(id);
        success = !! result;
    }
    catch(e) {
        throw new Error(e.message);
    }
    
    return success;
}

/**
 * authonticate a user by email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {object} signin object with status, user and token
 */
async function signIn(email, password) {
    let user = null;
    let token = null;
    let status = null;

    try {
        user = await User.findOne({ email });
    }
    catch(e) {
        throw new Error('Could not sign-in right now. Please try again later. Sory.');
    }

    if(user && user.password === password) {
        token = jwt.sign({ id: user._id }, process.env.USERS_SECRET, { algorithm: 'HS256', expiresIn: '1d' });
        status = { login: true, token }
    }
    else {
        status= { login: false, error: 'email or password are not correct' };
    }

    return { status, };
}

async function getAllUsers() {
    let users = null;

    try {
        users = await User.find({}, defaultUserProjection);
    }
    catch(e) {       
        throw new Error(e.message);       
    }

    return users;
}

function authorizeAll(req, res, next) {
    next();
}

function authorize(...roles) {
    let callback = null;

    if(!roles || roles.indexOf('all') > -1) {
        callback = authorizeAll;
    }
    else{
        callback = async (req, res, next) => {
            const { currentUserId, } = req.params;
            let user = null;
            let authorized = false;

            if(currentUserId) {
                user = await findById(currentUserId);                
            }

            if(user) {                
                authorized = -1 < roles.findIndex(role => {
                    let matched = false;

                    switch(role) {
                        case 'matchedUser':
                            const requestUserId = req.params.userid;
                            matched = currentUserId === requestUserId;
                            break;
                        default :
                            matched = user.role === role;
                            break;
                    } 
                    
                    return matched;
                });
            }

            if(!authorized) {
                res.status(403).send(`This path is forbiden for user: [${currentUserId}] with role: ${user.role}`);
            }
            else {
                next();
            }        
        };            
    }

    return callback;
}

function authonticate(req, res, next) {    
    let isVerified = false;
    let userId = null;
    const token = req.cookies.token;
    
    if(token) {
        const payload = jwt.verify(token, process.env.USERS_SECRET);
        userId = payload && payload.id;
        isVerified = !!userId;        
    }        
    if(isVerified) {
        req.params.currentUserId = userId;
        console.log(`verified user-id: ${userId}`);
        next();
    }         
    else {
        res.status(403).send('Autontication failed.');
    }    
}

module.exports = {
    addUser,
    findById,
    findByEmail,
    updateUser,
    removeUser,
    getAllUsers,
    authorize,
    authonticate,
    signIn
}
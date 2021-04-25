const { authorize, authonticate, ...usersApi } = require('../api/users'); 
const router = require('express').Router();

router.get('/list', authonticate, authorize('admin'), listAllUsers);

router.post('/update/:userid', authonticate, authorize('matchedUser','admin'),  updateUser);

router.post('/delete/:userid', authonticate,  authorize('matchedUser','admin'), deleteUser);

router.post('/signin', signin);

router.post('/signup', addNewUser);

router.get('/logout', logout)

router.get('/:userid', authonticate, authorize('matchedUser','admin'), getUser);


async function listAllUsers(req, res) {
    let users = null;
    
    try {
        users = await usersApi.getAllUsers();
        res.json({ users });
    }
    catch(e) {
        res.status(500).json({error: e.mesage});
    }
}

async function addNewUser(req, res) {
    const userData = req.body;
    let id = null;

    try {
        id = await usersApi.addUser(userData);
        res.json({ id });
    }
    catch(e) {
        res.status(500).json({ error: e.message });
    }
}

async function updateUser(req, res) {
    const { userid } = req.params;
    const userData = req.body;

    try {
        const success = await usersApi.updateUser(userid, userData);
        res.json({ success });
    }
    catch(e) {
        res.status(500).json({ error: e.message });
    }    
}

async function deleteUser(req, res) {
    const { userid } = req.params;

    try {
        const success = await usersApi.removeUser(userid);
    }
    catch(e) {
        res.status(500).json({ error: e.message });
    }
}

async function getUser(req, res) {
    const { userid, currentUserId } = req.params;
    
    try {
        const user = await usersApi.findById(userid);
        const status = user === null ? 404 : 200;
        res.status(status).json({ user });
    }
    catch(e) {
        res.status(500).json({ error: e.message });
    }        
}

async function signin(req, res) {
    const { email, password } = req.body;

    if(email && password) {
        const signInObj = await usersApi.signIn(email, password);
        if(signInObj.status.login){
            res.cookie('token', signInObj.status.token, { httpOnly: true });
        }
        
        res.json(signInObj.status);
    }
    else {
        res.status(400).json({
            error: 'missing email or password or both.'
        });
    }
}

function logout(req, res) {
    res.clearCookie('token');
    res.end();
}

module.exports = router;
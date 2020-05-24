const firebaseConfig = require('./utils/config');

const functions = require('firebase-functions');
const app = require('express')();

const {signup, login} = require("./handlers/users");
const {getAllScreams, postOneScream} = require('./handlers/screams')

const FBAuth = require('./utils/fbAuth');

// Screams routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// Users routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
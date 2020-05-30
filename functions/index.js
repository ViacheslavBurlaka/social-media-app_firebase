const firebaseConfig = require('./utils/config');

const functions = require('firebase-functions');
const app = require('express')();

const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require("./handlers/users");
const {getAllScreams, getScream, postOneScream, likeScream, unlikeScream, deleteScream} = require('./handlers/screams');

const FBAuth = require('./utils/fbAuth');

// Screams routes
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream);
app.delete('/screams/:screamId', FBAuth, deleteScream);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
// TODO: comment on scream

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
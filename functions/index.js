const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const app = express();
const firebase = require('firebase');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-app-4e12c.firebaseio.com"
});

const firebaseConfig = {
  apiKey: "AIzaSyCtM0aFRWA5OicblY4fL4Pmv2PP9eLgT0Y",
  authDomain: "social-media-app-4e12c.firebaseapp.com",
  databaseURL: "https://social-media-app-4e12c.firebaseio.com",
  projectId: "social-media-app-4e12c",
  storageBucket: "social-media-app-4e12c.appspot.com",
  messagingSenderId: "819376337815",
  appId: "1:819376337815:web:ff083f8651df9441b7cad2",
  measurementId: "G-F1CGGJ4XRE"
}

firebase.initializeApp(firebaseConfig);

const database = admin.firestore();

app.get('/screams', (req, res) => {
  database
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          ...doc.data()
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
})

// Create a documents
app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  database
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({message: `document ${doc.id} created successfully`});
    })
    .catch((err) => {
      res.status(500).json({error: 'at server something went wrong'});
      console.error(err);
    });
});

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  // validate data
  let token, userId;
  database
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        // user has already exist
        return res.status(400).json({handle: 'this handle is already taken'})
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      return database.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({token})
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          email: 'Email is already in use'
        })
      } else {
        return res.status(500).json({error: err.code})
      }
    })
})

exports.api = functions.https.onRequest(app);
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


// Authentication Middleware that protects connection to route
const FBAuth = (req, res, next) => {
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('Not token found')
    return res.status(403).json({error: 'Unauthorized'})
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      req.user = decodedIdToken;
      console.log(decodedIdToken);
      return database
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token', err);
      return res.status(403).json(err);
    })
}

// Create a documents
app.post('/scream', FBAuth, (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'Body must not be an empty'})
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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

const isEmpty = (string) => {
  return string.trim() === "";
}

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !!email.match(regEx);
}

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  // validate data
  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Must not be an empty'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email adress'
  }

  if (isEmpty(newUser.password)) {
    errors.password = 'Must not be empty'
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Passwords must be the same'
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = 'Must not be empty'
  }

  // In obj-errors are errors
  if (Object.keys(errors).length) {
    return res.status(400).json(errors)
  }

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

// Login route
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Must not be empty'
  }

  if (isEmpty(user.password)) {
    errors.password = 'Must not be empty'
  }

  if (Object.keys(errors).length) {
    return res.status(400).json(errors)
  }

  // if no errors
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({token})
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({general: 'Wrong credentials, please try again'})
      } else {
        return res.status(500).json({error: err.code})
      }
    });
})

exports.api = functions.https.onRequest(app);
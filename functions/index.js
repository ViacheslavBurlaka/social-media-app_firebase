const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json");

admin
  .initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://social-media-app-4e12c.firebaseio.com"
  });


const app = express();

app.get('/screams', (req, res) => {
  admin
    .firestore()
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

  admin
    .firestore()
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

// https://baseurl.com/api/

exports.api = functions.https.onRequest(app);
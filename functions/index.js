const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json");

admin
  .initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://social-media-app-4e12c.firebaseio.com"
  });


// get documents from DB
exports.getScreams = functions.https.onRequest((req, res) => {
  admin.firestore().collection('screams').get().then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push(doc.data());
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

// Create a documents
exports.createScream = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).json({error: 'Method now allowed!'})
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
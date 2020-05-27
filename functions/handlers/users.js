const {db, admin} = require('../utils/admin');

const firebaseConfig = require('../utils/config');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const {validateSignupData, validateLoginData, reduceUserDetails} = require('../utils/validators')

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  // Validate
  const {valid, errors} = validateSignupData(newUser);

  if (!valid) {
    return res
      .status(400)
      .json(errors)
  }

  let token, userId;
  db
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        // user has already exist
        return res
          .status(400)
          .json({handle: 'this handle is already taken'})
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
        userId: userId,
        imageUrl: null
      };
      return db
        .doc(`/users/${newUser.handle}`)
        .set(userCredentials)
    })
    .then(() => {
      return res
        .status(201)
        .json({token})
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        return res
          .status(400)
          .json({
            email: 'Email is already in use'
          })
      } else {
        return res
          .status(500)
          .json({general: "Something went wrong, please try again"});
      }
    })
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  // Validate
  const {valid, errors} = validateLoginData(user);

  if (!valid) {
    return res
      .status(400)
      .json(errors)
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
      // auth/wrong-password
      // auth/user-not-user
      return res
        .status(403)
        .json({general: "Wrong credentials, please try again"});
    });
}

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db
    .doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({message: 'Details added successfully'});
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({error: err.code})
    })
}

exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db
    .doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db.collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = []
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData)
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({error: err.code})
    })
}

exports.uploadImage = (req, res) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({headers: req.headers})

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res
        .status(400)
        .json({error: 'Wrong file type submitted'})
    }

    // image.png
    const imageExtension = filename.split('.').pop();
    // decoded to some like 502941280.png
    imageFileName = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = {filePath, mimetype};
    file.pipe(fs.createWriteStream(filePath));
  });

  // upload created file to firebase
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket(firebaseConfig.storageBucket)
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db
          .doc(`/users/${req.user.handle}`)
          .update({
            imageUrl: imageUrl
          })
      })
      .then(() => {
        return res.json({message: 'Image uploaded successfully'});
      })
      .catch((err) => {
        console.error(err);
        return res
          .status(500)
          .json({
            error: err.code
          });
      })
  })
  busboy.end(req.rawBody);
};

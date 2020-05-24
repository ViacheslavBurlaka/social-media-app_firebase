const {db} = require('../utils/admin');

/**
 * Get all notices from the Firebase
 */
exports.getAllScreams = (req, res) => {
  db
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
}

/**
 * Post one notice to the Firebase
 */
exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'Body must not be an empty'})
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  db
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({message: `document ${doc.id} created successfully`});
    })
    .catch((err) => {
      res.status(500).json({error: 'at server something went wrong'});
      console.error(err);
    });
}

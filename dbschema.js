let db = {
  users: [
    {
      "createdAt": "2020-05-26T19:42:08.849Z",
      "imageUrl": "image/dsfsdkfghskdfgs/dgfdhfgdh",
      "userId": "MQ09rCh0OVaHX1piXJpdAfRaFJC2",
      "bio": "Hello, i am a professional web developer",
      "website": "http://my-site.it",
      "location": "Italy, Milan",
      "email": "karlo@email.com",
      "handle": "Karlo"
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream(post) body',
      createdAt: '2020-05-24T12:57:29.314Z',
      likeCount: 7,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'kdjsfgdksuufhgkdsufky',
      body: 'nice one mate!',
      createdAt: '2020-05-24T12:57:29.314Z',
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true | false',
      screamId: 'kdjsfgdksuufhgkdsufky',
      type: 'like | comment',
      createdAt: '2020-05-24T12:57:29.314Z',
    }
  ]
}

const userDetails = {
  // Redux data
  credentials: {
    userId: 'MQ09rCh0OVaHX1piXJpdAfRaFJC2',
    email: 'user@email.com',
    handle: 'user',
    createdAt: '2020-05-24T12:57:29.314Z',
    imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
    bio: 'Hello, my name is user, nice to meet you',
    website: 'https://user.com',
    location: 'Manchester, UK'
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'hh7O5oWfWucVzGbHH2pa'
    },
    {
      userHandle: 'user',
      screamId: '3IOnFoQexRcofs5OhBXO'
    }
  ]
};

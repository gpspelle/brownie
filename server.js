const express = require('express');
const { OAuth2Client } = require('google-auth-library')
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
const google_auth_client = new OAuth2Client(process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID)

const mongodb_user = process.env.REACT_APP_MONGODB_CLIENT_ID;
const mongodb_secret_key = process.env.REACT_APP_MONGODB_SECRET_KEY;
const mongodb_server = process.env.REACT_APP_MONGODB_SERVER;
const mongodb_database = process.env.REACT_APP_MONGODB_DATABASE;
const mongodb_database_collection = process.env.REACT_APP_MONGODB_DATABASE_COLLECTION
const mongodb_uri = `mongodb+srv://${mongodb_user}:${mongodb_secret_key}@${mongodb_server}/${mongodb_database}?retryWrites=true&w=majority`;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.post("/api/v1/auth/google", async (req, res) => {    
  const { token }  = req.body    
  const ticket = await google_auth_client.verifyIdToken({
    idToken: token,
    audience: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID
  });
  
  const { name, email, picture } = ticket.getPayload();

  MongoClient.connect(mongodb_uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mongodb_database);

    const query = { email: email };
    const update = { $set: { name: name, email: email, picture: picture }};
    const options = { upsert: true };
    const user = dbo.collection(mongodb_database_collection).updateOne(query, update, options);
    req.session.userId = user.id
    res.json(user)
    res.status(201)
    db.close();
  }); 

})

app.use(async (req, res, next) => {

  MongoClient.connect(mongodb_uri, function(err, db) {
    if (err) throw err;
    var dbo = db.db(mongodb_database);

    const query = { email: req.session.email };
    const findResult = dbo.collection(mongodb_database_collection).find(query);
    db.close();

    req.user = findResult;
  });

  next()
})

app.delete("/api/v1/auth/logout", async (req, res) => {
  await req.session.destroy()
  res.status(200)
  res.json({
      message: "Logged out successfully"
  })
})

app.get("/me", async (req, res) => {
  res.status(200)
  res.json(req.user)
})
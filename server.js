const express = require('express');
const { OAuth2Client } = require('google-auth-library')
const { MongoClient } = require('mongodb');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;
const google_auth_client = new OAuth2Client(process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID)

const mongodb_user = process.env.REACT_APP_MONGODB_CLIENT_ID;
const mongodb_secret_key = process.env.REACT_APP_MONGODB_SECRET_KEY;
const mongodb_server = process.env.REACT_APP_MONGODB_SERVER;
const mongodb_database = process.env.REACT_APP_MONGODB_DATABASE;
const mongodb_database_collection = process.env.REACT_APP_MONGODB_DATABASE_COLLECTION;
const mongodb_uri = `mongodb+srv://${mongodb_user}:${mongodb_secret_key}@${mongodb_server}/${mongodb_database}?retryWrites=true&w=majority`;
const mongodb_client = new MongoClient(mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.json())
app.use(session({ resave: true, secret: '123456', saveUninitialized: true }));

app.post("/api/v1/auth/google", async (req, res) => {    
  const { token }  = req.body    
  const ticket = await google_auth_client.verifyIdToken({
    idToken: token,
    audience: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID
  });
  
  const { name, email, picture } = ticket.getPayload();

  mongodb_client.connect(err => {
    if (err) throw err;
    var dbo = mongodb_client.db(mongodb_database);

    const query = { email: email };
    const user = { name: name, email: email, picture: picture }
    const update = { $set: user };
    const options = { upsert: true };
    dbo.collection(mongodb_database_collection).updateOne(query, update, options);
    req.session.email = user.email

    const message = { userData: user, message: "Loged in successfully" }
    res.json(message)
    res.status(201)
  });
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
  res.json(req.session.email)
})

app.get("/test", async (req, res) => {
  res.status(200)
  res.json({ message: "I am running and live"})
})
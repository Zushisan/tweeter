"use strict";

// Basic express setup:

const PORT          = 8080;
const express       = require("express");
const bodyParser    = require("body-parser");
const app           = express();
const cookieSession = require('cookie-session');

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://localhost:27017/tweeter";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.error(`Failed to connect: ${MONGODB_URI}`);
    throw err;
  }

  // We have a connection to the "tweeter" db, starting here.
  console.log(`Connected to mongodb: ${MONGODB_URI}`);

// The in-memory database of tweets. It's a basic object with an array in it.
// const db = require("./lib/in-memory-db");

// The `data-helpers` module provides an interface to the database of tweets.
// This simple interface layer has a big benefit: we could switch out the
// actual database it uses and see little to no changes elsewhere in the code
// (hint hint).
//
// Because it exports a function that expects the `db` as a parameter, we can
// require it and pass the `db` parameter immediately:
const DataHelpers = require("./lib/data-helpers.js")(db);

// The `tweets-routes` module works similarly: we pass it the `DataHelpers` object
// so it can define routes that use it to interact with the data layer.
const tweetsRoutes = require("./routes/tweets")(DataHelpers);

// Mount the tweets routes at the "/tweets" path prefix:
app.use("/tweets", tweetsRoutes);

});


app.use(cookieSession({
  name: 'session',
  secret: "key1",
}));

  // Fake user DB.
  const usersDB = [
    {email: "romain", password: "12"}
  ];


// Registration Form
app.post('/register', (req, res) => {

  for (let object of usersDB){
    if(object.email === req.body.email){
      res.status(400).json("Error: user already exist");
    }
  }

    function registerUser(userID){
      usersDB.push(userID);
      res.status(201).json(userID);
    }

    console.log("req body", req.body.email);
    req.session.user_id = req.body.email;
    registerUser(req.body);

});


app.get('/login', (req, res) => {

  if(req.session.user_id){
    res.status(201).json(req.session.user_id);
  }else{
    res.status(201).json(false);
  }

});

// Registration Form
app.post('/login', (req, res) => {

  function email(user){return user.email === req.body.email}
  function password(user){return user.password === req.body.password}

  let checkCredentials = usersDB.filter(email).filter(password);

  if(checkCredentials.length > 0){
    req.session.user_id = req.body.email;
    res.status(201).json(req.body);
  }
  else{
    res.status(404).json("Error: user not found");
  }

});

// Logout
app.post("/logout", (req, res) => {
  console.log("logout post")
  req.session = null;
  res.status(201).json("success");
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});

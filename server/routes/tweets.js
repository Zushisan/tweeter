"use strict";

const userHelper    = require("../lib/util/user-helper")

const express       = require('express');
const tweetsRoutes  = express.Router();

//Random Tweet ID generator
function generateRandomID() {
  // userInfo.password = bcrypt.hashSync(userInfo.password, 10);
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return randomID;
}


module.exports = function(DataHelpers) {

  tweetsRoutes.get("/", function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(tweets);
      }
    });
  });

  // Create a new user for the tweet sent
  tweetsRoutes.post("/", function(req, res) {

    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    if(!req.session.user_id){
      res.status(400).json({ error: 'invalid request: not logged in'});
      return;
    }



    const user = req.body.user ? req.body.user : userHelper.generateRandomUser(req.session.user_id);
    const tweetID = generateRandomID();

    const tweet = {
      tweetID: tweetID,
      user: user,
      content: {
        text: req.body.text,
        likes: []
      },
      created_at: Date.now()
    };

    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send();
      }
    });
  });

  // Updates the database in putLike()
  tweetsRoutes.post("/likes", function(req, res) {

    if(!req.session.user_id){
      res.status(400).json({ error: 'invalid request: You need to login to like !'});
      return;
    }

    DataHelpers.putLike(req.body.data, req.session.user_id, (err, msg) => {
      if (err) {

        console.log(msg);
        if (msg) {
          console.log("cant send header ?");
          res.status(404).json(msg);
          console.log("cant send header 22222");
        }
        else {
          res.status(500).json({ error: err.message });
        }

      }
      else {
        console.log("sending 201");
        res.status(201).send();
      }
    });
  });

  return tweetsRoutes;

}

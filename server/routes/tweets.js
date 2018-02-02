"use strict";

const userHelper    = require("../lib/util/user-helper")

const express       = require('express');
const tweetsRoutes  = express.Router();

//Random Tweet ID generator
function generateRandomID() {
  // userInfo.password = bcrypt.hashSync(userInfo.password, 10);
  let randomID = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++){
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
      res.status(400).json('Sorry, you need to Login to like !');
      return;
    }

    DataHelpers.putLike(req.body.data, req.session.user_id, (err, msg) => {
      if (err) {
        if (msg) {
          res.status(404).json(msg);
        }
        else {
          res.status(500).json({ error: err.message });
        }

      }
      else {
        res.status(201).send();
      }
    });
  });




  return tweetsRoutes;

}

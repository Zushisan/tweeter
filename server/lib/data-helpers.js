"use strict";

// Simulates the kind of delay we see with network or filesystem operations
const simulateDelay = require("./util/simulate-delay");



// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function(newTweet, callback) {
      simulateDelay(() => {
        db.collection("tweets").insertOne(newTweet);
        // db.tweets.insertOne(newTweet);
        callback(null, true);
      });
    },

    getTweets: function(callback) {
      db.collection("tweets").find().toArray((err, tweets) => {
        if (err) {
          return callback(err);
        }
        callback(null, tweets);
      });
    },

    // Update the database
    putLike: function(uid, callback) {

      let currentUser = "Romain";

      // Get the tweet we want to update likes with his UID
      db.collection("tweets").find( { tweetID : uid } ).toArray((err, tweets) => {
          if(err){
            return console.log("error in db find");
          }

          // We store our updated value
          let currentText = tweets[0].content.text;
          let currentLikes = tweets[0].content.likes;

          currentLikes.push(currentUser);

          // We push our value in the database, text has to be set again or will be erased
          db.collection("tweets").update(
          { tweetID : uid },
            { $set:
              {
                content:
                  {
                    text: currentText,
                    likes: currentLikes
                  }
              }
            }
          );
       });
    }



  } // return
} // export




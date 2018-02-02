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
    putLike: function(uid, cookie, callback) {

      let currentUser = cookie;

      // Get the tweet we want to update likes with his UID
      db.collection("tweets").find( { tweetID : uid } ).toArray((err, tweets) => {
          if(err){
            return console.log("Error in the db request");
          }

          // We run our checks here:
            // Cannot like own tweets
            // Liking a tweet multiple times add/remove name from the like array

          if(tweets[0].user.name === currentUser){
            callback(true, "You cannot like your own tweets !!");
          }
          else {


            let likeArray = tweets[0].content.likes
            // if I find the name (currentUser), then i remove it
            // if I dont find the name I push it in the array

            let likingUser = likeArray.find(function(element) {
              return element === currentUser;
            });

            if(likingUser){

              likeArray = likeArray.filter(user => user !== currentUser);
            }
            else{
              likeArray.push(currentUser);
            }

            // We store our updated value
            let currentText = tweets[0].content.text;

            // We push our value in the database, text has to be set again or will be erased
            db.collection("tweets").update(
            { tweetID : uid },
              { $set:
                {
                  content:
                    {
                      text: currentText,
                      likes: likeArray
                    }
                }
              }
            ); // end db update
            callback();
          }
         }); // end db find()

    } // putlike function

  } // return
} // export




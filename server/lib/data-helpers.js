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
        callback(null);
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
            return callback(err);
          }

          // We run our checks here:
            // Cannot like own tweets
            // Liking a tweet multiple times add/remove name from the like array

          if(tweets[0].user.name === currentUser){
            callback(null, "You cannot like your own tweets !!");
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
            callback(null);
          }
         }); // end db find()

    }, // putlike function

    registerUser: function(userID, callback){
      // Get the corresponding user if it exist return an error, if not we register
      db.collection("users").find( { email : userID.email } ).toArray((err, users) => {
        if(err){
          return callback(err);
        }

        // Checking users, could be === 1 but >= 1 seems to handle unexpected behavior better.
        if(users.length >= 1){
          callback(null, "User already exist !!");
        }
        else{
          // userID.password = bcrypt.hashSync(userID.password, 10);
          db.collection("users").insertOne(userID);
          callback(null, null, userID);
        }

      });
    }, // registerUser

    userLogin: function(userID, bcrypt, callback){
      db.collection("users").find( { email : userID.email })
        .toArray((err, users) => {
          if(err){
            return callback(err);
          }

          // Checking if a user exist, could be === 1
          if(users.length >= 1){
            if(bcrypt.compareSync(userID.password, users[0].password)){
             callback(null, null, userID);
            }
            else{
              callback(null, "Incorrect credentials, use Register to create an account.")
            }
          }
          else{
            callback(null, "Incorrect credentials, use Register to create an account.")
          }
        });
      } // userLogin



  } // return
} // export




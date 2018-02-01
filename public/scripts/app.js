/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

// A $( document ).ready() block.
$( document ).ready(function() {

  let currentUser = {
  }

  // XSS prevention => escaping
  function escape(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Create our html code for new tweets
  function createTweetElement(tweet) {

    let fullName = tweet.user.name;
    let avatarUrl = tweet.user.avatars.small;
    let atName = tweet.user.handle;
    let tweetContent = tweet.content.text;
    let tweetID = tweet.tweetID;
    let likeArray = tweet.content.likes;

    // let utcSeconds = tweet.created_at;
    let timeStamp = Date(tweet.created_at).toString();


    let $tweet = $('<div id="tweet-container"><div class="header"><header><img alt="vanil12" src="' + avatarUrl + '"><span class="full-name"> ' + fullName + ' </span><span class="at-name"> ' + atName + ' </span></header></div><article><p> ' + escape(tweetContent) + ' </p></article><footer><span> ' + timeStamp + ' </span><div class="icons"><i class="fa fa-flag mini-icons" aria-hidden="true"></i><i class="fa fa-retweet mini-icons" aria-hidden="true"></i><form class="likes-form" action="/tweets/likes" method="POST" data-tweet-uid="' + tweetID + '"><button type="submit"><i class="fa fa-heart mini-icons"></i></button></form><span>' + likeArray.length + '</span></div></footer></div>');


    return $tweet;
  }


  // Render the html tweet sent by the createTweetElement()
  function renderTweets(tweets) {
    // loops through tweets
    $('#display-tweets').remove();
    for(tweet in tweets){
      // calls createTweetElement for each tweet
      let fullTweet = createTweetElement(tweets[tweet]);

      // takes return value and appends it to the tweets container
      $('.tweet-section').append('<section id="display-tweets"></section>')
      $('#display-tweets').prepend(fullTweet);
    }
  }

  // Get the tweets from the DB and render them
  function loadTweets($myTweet){
    $.ajax({
      url: '/tweets',
      method: 'GET',
      success: function ($myTweet) {
        renderTweets($myTweet);
      }
    });

  }


  function checkCookies(){

    // We check our cookies on page load
    $.ajax({
      url: '/login',
      method: 'GET',
      success: function (res) {

        if(res){
          $(".user-logged").remove();
          $(".tweet-section").prepend('<p class="user-logged"> Logged in as: ' + res + '. </p>');

        }
        else if(res === false) {
          $(".user-logged").remove();
          $(".tweet-section").prepend('<p class="user-logged"> Please LOGIN to start TWEETIN. </p>');

        }
      }
    });
  }


  // The tweet submit form
  $( ".new-tweet form" ).on('submit', function( event ) {

    $('.flash').remove();

    let string = $("textarea").val();
    string = string.replace(/\s+/g, '');

    // Empty tweet and too long tweet error handlers
    if (string.length <= 0){
       $('.new-tweet').append("<p class='flash'> Alert, message cannot be empty !!!</p>");
       event.preventDefault();
       return;
    }

    if (string.length > 140){
     $('.new-tweet').append("<p class='flash'> Alert, message must be less or equal to 140 characters !!!</p>");
     event.preventDefault();
     return;
    }


    // jquery ajax new tweet POST
    $.ajax({
      url: '/tweets',
      method: 'POST',
      data: $(this).serialize(),
      error: function() {

      $('.new-tweet').append("<p class='flash'> Alert, you must be logged in to tweet !!!</p>");
      },
      success: function () {
        loadTweets();
        $('textarea').val('');
        // $('.counter').val('140');
      }
    });

    event.preventDefault();
  });

  // nav bar compose button toggle effect
  $("#nav-bar .compose").on('click', function(){
    $(".new-tweet").slideToggle();
    if ($(".new-tweet").is(':visible'))
    {
        $("textarea").focus();
    }
  });


// My Like button on submit
  $(".tweet-section").on('submit', '.likes-form', function(event){

    let currentSection = $(this).parent().parent().parent();
    let dataValue = ($(this).attr("data-tweet-uid"));
    console.log("My Data in submit event: " + dataValue);


    $.ajax({
      url: '/tweets/likes',
      method: 'POST',
      data: {data: dataValue},
      error: function(res) {
        $(".flash").remove();

        currentSection.prepend('<p class="flash">' + res.responseText + '</p>');
      },
      success: function () {
        $(".flash").remove();
        console.log("like success");
        loadTweets();

      }
    });
    event.preventDefault();
  });


  $("#nav-bar button.register").one('click', function(){
    $('.tweet-section').slideToggle();
    $('<form action="/register" method="POST" class="register-form"><h3>Register</h3><p>e-mail: <input name="email" class="email"></p><p>password: <input name="password" class="password"></p><input type="submit" value="Create Account" class="users"></form>').appendTo('.container');

    $("#nav-bar button.register").on('click', function(){
        $('.register-form').slideToggle();
        $('.tweet-section').slideToggle();
    });
  });


  $(".container").on('submit', '.register-form', function(event){

    $.ajax({
      url: '/register',
      method: 'POST',
      data: $(this).serialize(),
      error: function(res) {
        $(".flash").remove();
        $(".container").append('<p class="flash">' + res.responseText + '</p>');
      },
      success: function (res) {
        $(".flash").remove();
        $(".user-logged").remove();
        $('.register-form').slideToggle();
        $('.tweet-section').slideToggle();
        $(".tweet-section").prepend('<p class="user-logged"> Logged in as ' + res.email + '. </p>');


      }
    });
    event.preventDefault();
  });



  $("#nav-bar button.login").one('click', function(){
    $('.tweet-section').slideToggle();
    $('<form action="/login" method="POST" class="login-form"><h3>Login</h3><p>e-mail: <input name="email" class="email"></p><p>password: <input name="password" class="password"></p><input type="submit" value="Create Account" class="users"></form>').appendTo('.container');

    $("#nav-bar button.login").on('click', function(){
        $('.login-form').slideToggle();
        $('.tweet-section').slideToggle();
    });

  });


  $(".container").on('submit', '.login-form', function(event){

    $.ajax({
      url: '/login',
      method: 'POST',
      data: $(this).serialize(),
      error: function(res) {
        $(".flash").remove();

        $(".container").append('<p class="flash">' + res.responseText + '</p>');
      },
      success: function (res) {
        $(".flash").remove();
        $(".user-logged").remove();
        $('.login-form').slideToggle();
        $('.tweet-section').slideToggle();
        $(".tweet-section").prepend('<p class="user-logged"> Logged in as ' + res.email + '. </p>');


      }
    });
    event.preventDefault();
  });


    $(".logout").on('click', function(event){

      console.log("click logout");

    $.ajax({
      url: '/logout',
      method: 'POST',
      // data: $(this).serialize(),
      error: function() {
        $(".flash").remove();
      },
      success: function () {
        $(".flash").remove();

        checkCookies();

      }
    });
    event.preventDefault();
  });

loadTweets();
checkCookies();

}); // Document ready end



// user register, set cookie and data in DB
// user login -> check db and return response in the ajax succes with res.body

//cookie is gonna be set in the header of every http request going to the server and will be used to check users

//my global var is gonna come in as an html element that only append itself if the user is logged in

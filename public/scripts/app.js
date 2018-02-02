/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

// A $( document ).ready() block.
$( document ).ready(function() {

  // XSS prevention => escaping
  function escape(str) {
    let div = document.createElement('div');
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
    let timeStamp = Date.now() - tweet.created_at;

    function convertMS(ms) {
      let d, h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return { d: d, h: h, m: m, s: s };
    };

    timeStamp = convertMS(timeStamp);


    timeStamp = `${timeStamp.d} days ${timeStamp.h} hours ${timeStamp.m} min ${timeStamp.s} sec ago.`

    // Futur render
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
          $(".logout").show();
          $(".login").hide();

        }
        else if(res === false) {
          $(".user-logged").remove();
          $(".tweet-section").prepend('<p class="user-logged"> Please LOGIN to start TWEETING. </p>');
          $(".logout").hide();
          $(".login").show();
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
    let thisForm = $(this);

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
        loadTweets();

      }
    });
    event.preventDefault();
  });

  // register form design
  $("#nav-bar button.register").one('click', function(){
    $('.tweet-section').slideToggle();
    $('<form action="/register" method="POST" class="register-form"><h3>Register</h3><p>e-mail: <input name="email" class="email"></p><p>password: <input name="password" class="password"></p><input type="submit" value="Create Account" class="users"></form>').appendTo('.container');

    $("#nav-bar button.register").on('click', function(){
        $('.register-form').slideToggle();
        $('.tweet-section').slideToggle();
    });
  });

  // register form submit
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
        $(".login").hide();
        $(".logout").show();
        $('.register-form').slideToggle();
        $('.tweet-section').slideToggle();
        $(".tweet-section").prepend('<p class="user-logged"> Logged in as ' + res + '. </p>');
      }
    });
    event.preventDefault();
  });


  // login form design
  $("#nav-bar button.login").one('click', function(){
    $('.tweet-section').slideToggle();
    $('<form action="/login" method="POST" class="login-form"><h3>Login</h3><p>e-mail: <input name="email" class="email"></p><p>password: <input name="password" class="password"></p><input type="submit" value="Login" class="users"></form>').appendTo('.container');

    $("#nav-bar button.login").on('click', function(){
        $('.login-form').slideToggle();
        $('.tweet-section').slideToggle();
    });

  });

  // login form submit
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
        $(".logout").show();
        $(".login").hide();
        $('.login-form').slideToggle();
        $('.tweet-section').slideToggle();
        $(".tweet-section").prepend('<p class="user-logged"> Logged in as ' + res + '. </p>');
      }
    });
    event.preventDefault();
  });

    // log out handler
    $(".logout").on('click', function(event){
    $.ajax({
      url: '/logout',
      method: 'POST',
      // data: $(this).serialize(),
      error: function() {
        $(".flash").remove();
      },
      success: function () {
        $(".flash").remove();
        $(".logout").hide();
        $(".login").show();
        checkCookies();

      }
    });
    event.preventDefault();
  });


// Initial call on load
loadTweets();
checkCookies();

}); // Document ready end



// TODO:
  // encrypt passwords
  // fix some css
  // fix register/login toggle mix
  // responsive css

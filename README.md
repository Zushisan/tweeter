# Tweeter Project

Tweeter is a simple, single-page Twitter clone.

Tweeter is built with HTML, CSS, JS, jQuery and AJAX for the front-end. Node, Express and MongoDB for the back-end.

## Getting Started

1. Install dependencies using the `npm install` command.
2. Start the web server using the `npm start` command. The app will be served at <http://localhost:8080/>.
3. Go to <http://localhost:8080/> in your browser.

## Dependencies

- Express
- Node 5.10.x or above
- Chance
- md5
- MongoDB
- cookie-session
- Bcrypt

## Guidelines and Info

The current version support persistent Tweet via the MongoDB database. User will have to Register and/or Login to Tweet.

The current version does support persistent User via the MongoDB database.

You will have to Register any account before using Tweeter.

## Screenshots

!["Screenshot of Main page"](https://github.com/Zushisan/tweeter/blob/master/docs/tweeter-main-page.png?raw=true)

!['Screenshot of Main page again"](https://github.com/Zushisan/tweeter/blob/master/docs/tweeter-main-page-2.png?raw=true)

## Known Bugs

Expanding and Shrinking the window while registering / logging in / logging out will sometimes cause the Buttons to break their positions.

Using the login and register button the first time the page is loaded can lead to a one time visual 'glitch' (both windows at the same time) if the user open both at once.

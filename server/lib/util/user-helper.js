"use strict";

const Chance = require("chance");
const chance = new Chance();

const md5 = require('md5');


module.exports = {

  generateRandomUser: (cookie) => {
    const gender    = chance.gender();
    const firstName = chance.first({gender: gender});
    const lastName  = chance.last();
    const userName  = firstName + " " + lastName;

    let cookieHandle = "@"+cookie[0]+cookie[1]+cookie[cookie.length -2]+cookie[cookie.length -1];

    let userHandle = "@";
    if (Math.random() > 0.5) {
      let prefix    = chance.prefix({gender: gender});
      prefix = prefix.replace(".", "");
      userHandle += prefix
    }

    userHandle += lastName;

    if (Math.random() > 0.5) {
      const suffix = Math.round(Math.random() * 100);
      userHandle += suffix;
    }

    const avatarUrlPrefix = `https://vanillicon.com/${md5(cookieHandle)}`;
    const avatars = {
      small:   `${avatarUrlPrefix}_50.png`,
      regular: `${avatarUrlPrefix}.png`,
      large:   `${avatarUrlPrefix}_200.png`
    }




    return {
      name: cookie,
      handle: cookieHandle,
      avatars: avatars
    };
  }
};

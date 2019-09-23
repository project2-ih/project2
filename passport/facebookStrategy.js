require("dotenv").config();

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

// Crypto
const crypto = require("crypto");

passport.use(
  new FacebookStrategy(
    {
      clientID: `${process.env.FACEBOOK_APP_ID}`,
      clientSecret: `${process.env.FACEBOOK_APP_SECRET}`,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"]
    },

    (accessToken, refreshToken, profile, done) => {
      console.log(profile)
      User.findOne({ facebookId: profile.id })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          const confirmationCode = crypto.randomBytes(20).toString("hex");

          User.create({
            facebookId: profile.id,
            username: profile.displayName,
            profilePhoto: `https://graph.facebook.com/${profile.id}/picture?width=360&height=360 `,
            // email: profile.email,
            confirmationCode
          })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const localStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const extractJwt = passportJWT.ExtractJwt;
const jwtStrategy = require("passport-jwt").Strategy;
const models = require("../models");
const key = require("../utils/config");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  models.User.findById(id).then(user => {
    console.log("find user desirliasze ", user);

    done(null, user);
  });
});

passport.use(
  "local",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) => {
      return models.User.findOne({ where: { email: email } }).then(user => {
        if (!user) {
          return done(true, false, { msg: "Incorrect email" });
        }
        return bcrypt.compare(password, user.dataValues.password, function(
          errBycrypt,
          resBycrypt
        ) {
          if (resBycrypt)
            return done(null, user, {
              message: "Logged In Successfully"
            });
          else
            return done(null, false, {
              message: "Incorrect password."
            });
        });
      });
    }
  )
);

passport.use(
  "jwt",
  new jwtStrategy(
    {
      jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: key.jwt.secret
    },
    function(jwtPayload, done) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      models.User.findById(jwtPayload.id)
        .then(user => {
          done(null, user);
        })
        .catch(err => {
          done(err, { message: "Error token" });
        });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      // options for google strategy
      clientID: key.google.clientID,
      clientSecret: key.google.clientSecret,
      callbackURL: key.google.callbackURL
    },
    (accessToken, refreshToken, profile, done) => {
      // passport callback function
      models.User.findOne({ where: { googleID: profile.id } }).then(
        currentUser => {
          if (currentUser) {
            // already have this user
            done(null, currentUser.dataValues);
          } else {
            // if not, create user in our db

            const newUser = new models.User({
              googleID: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value
            });

            newUser.save().then(newUser => {
              done(null, newUser.dataValues);
            });
          }
        }
      );
    }
  )
);
passport.use(
  "facebook",
  new FacebookStrategy(
    {
      clientID: key.facebook.clientID,
      clientSecret: key.facebook.clientSecret,
      callbackURL: key.facebook.callbackURL,
      profileFields: ["emails", "name", "displayName", "profileUrl"]
    },
    function(accessToken, refreshToken, profile, done) {
      models.User.findOne({ where: { facebookID: profile.id } }).then(
        currentUser => {
          if (currentUser) {
            console.log("user found", profile);

            done(null, currentUser.dataValues);
          } else {
            const newUser = new models.User({
              facebookID: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value
            });
            newUser.save(newUser => {
              done(null, newUser.dataValues);
            });
          }
        }
      );
    }
  )
);

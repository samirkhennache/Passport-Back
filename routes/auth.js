const express = require("express");
const Router = express.Router();
var jwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../utils/config");
// require("../utils/passport");
const models = require("../models");
const bcrypt = require("bcrypt");

Router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({ sucess: "true" });
  }
);
// Router.get("/facebook/r", (req, res) => {
//   res.status(200).send("coucou connexion facebook");
// });
// Router.get("/facebook/redirect", (req, res) => {
//   res.status(200).send("coucou connexion facebook redirect URI");
// });
// Router.get("/google", (req, res) => {
//   res.status(200).send("coucou connexion google");
// });
// Router.get("/google/redirect", (req, res) => {
//   res.status(200).send("coucou connexion google redirect URI");
// });

/*****************************Local strategy */
Router.post("/register", (req, res, next) => {
  const { body } = req;
  const { email, firstName, lastName, password } = body;

  models.User.findOne({ attributes: ["email"], where: { email: email } })
    .then(userFound => {
      if (!userFound) {
        bcrypt.hash(password, 10, (err, bcryptedPassword) => {
          const newUser = new models.User({
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: bcryptedPassword
          });

          newUser.save().then(userFound => {
            const userData = {
              id: userFound.dataValues.id,
              firstName: userFound.dataValues.firstName,
              email: userFound.dataValues.email
            };
            jwt.sign(
              {
                id: userFound.dataValues.id,
                firstName: userFound.dataValues.firstName,
                email: userFound.dataValues.email
              },
              key.jwt.secret,
              (err, token) => {
                if (err) {
                  console.log(err);
                }
                res.header("Access-Control-Expose-Headers", "x-access-token");
                res.set("x-access-token", token);
                res.status(200).send({
                  message: "user created",
                  connexion: true
                });
              }
            );
          });
        });
      } else {
        return res.status(409).json({ error: "user already exist" });
      }
    })
    .catch(err => {
      return res.status(500).json({ error: "unable to verify user" });
    });
});

Router.post("/signIn", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err && !user) {
      res.status(401).send({ success: false, msg: "Login Failed" });
    } else {
      req.login(user, { session: false }, err => {
        if (!user) {
          res.status(401).send({ success: false, msg: err });
        } else {
          console.log(user);

          const userData = {
            id: user.dataValues.id,
            firstName: user.dataValues.firstName,
            email: user.dataValues.email
          };
          const token = jwt.sign(
            {
              id: user.dataValues.id,
              firstName: user.dataValues.firstName,
              email: user.dataValues.email
            },
            key.jwt.secret,
            {
              expiresIn: 86400 // expires in 24 hours
            }
          );
          res.header("Access-Control-Expose-Headers", "x-access-token");
          res.set("x-access-token", token);
          return res.status(200).json({ success: true });
        }
      });
    }
  })(req, res, next);
});

/**************google + */
Router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
Router.post("/signIn/google", (req, res) => {
  const token = req.headers["authorization"];
  const user = jwt.decode(token);
  console.log("decoded token ", user);

  if (user) {
    models.User.findOne({
      where: { googleID: user.sub }
    }).then(userFound => {
      console.log("my user");

      if (!userFound) {
        const newUser = new models.User({
          googleID: user.sub,
          email: user.email,
          firstName: user.given_name,
          lastName: user.family_name
        });
        newUser.save().then(user => {
          const token = jwt.sign(
            {
              id: user.dataValues.id,
              firstName: user.dataValues.firstName,
              email: user.dataValues.email
            },
            key.jwt.secret,
            {
              expiresIn: 86400 // expires in 24 hourses.
            }
          );
          res.header("Access-Control-Expose-Headers", "x-access-token");
          // res.setHeader("x-access-token", req.token);
          res.set("x-access-token", token);
          res.status(200).json({ success: true });
        });
      }
      const token = jwt.sign(
        {
          id: userFound.dataValues.id,
          firstName: userFound.dataValues.firstName,
          email: userFound.dataValues.email
        },
        key.jwt.secret,
        {
          expiresIn: 86400 // expires in 24 hourses.
        }
      );
      res.header("Access-Control-Expose-Headers", "x-access-token");
      // res.setHeader("x-access-token", req.token);
      res.set("x-access-token", token);
      res.status(200).json({ success: true });
      //console.log(res);
    });
  } else {
    res.status(404).json({ Message: "error authentification" });
  }
});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
Router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401).send({ success: false });
  } else {
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.firstName,
        email: user.email
      },
      key.jwt.secret,
      {
        expiresIn: 86400 // expires in 24 hours
      }
    );
    res.status(200).redirect(`http://localhost:3000/home?token=${token}`);
  }
});
/**************************************facebook */
Router.post("/signIn/facebook", (req, res) => {
  console.log(req.body);
  const user = req.body;

  if (user) {
    models.User.findOne({
      where: { facebookID: user.userID }
    }).then(userFound => {
      if (!userFound) {
        const newUser = new models.User({
          facebookID: user.userID,
          email: user.email
        });
        newUser.save().then(user => {
          console.log("user saved", user);

          const token = jwt.sign(
            {
              id: user.dataValues.id,
              email: user.dataValues.email
            },
            key.jwt.secret,
            {
              expiresIn: 86400 // expires in 24 hourses.
            }
          );
          res.header("Access-Control-Expose-Headers", "x-access-token");
          // res.setHeader("x-access-token", req.token);
          res.set("x-access-token", token);
          res.status(200).json({ success: true });
        });
      }
      const token = jwt.sign(
        {
          id: userFound.dataValues.id,
          email: userFound.dataValues.email
        },
        key.jwt.secret,
        {
          expiresIn: 86400 // expires in 24 hourses.
        }
      );
      res.header("Access-Control-Expose-Headers", "x-access-token");
      // res.setHeader("x-access-token", req.token);
      res.set("x-access-token", token);
      res.status(200).json({ success: true });
    });
  } else {
    res.status(404).json({ Message: "error authentification" });
  }
});
Router.get("/facebook", passport.authenticate("facebook"));
Router.get(
  "/facebook/redirect",
  passport.authenticate("facebook"),
  (req, res) => {
    const { user } = req;
    if (!user) {
      res.status(401).send({ success: false });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        key.jwt.secret,
        {
          expiresIn: 86400 // expires in 24 hours
        }
      );

      res.status(200).redirect(`http://localhost:3000?token=${token}`);
    }
  }
);

module.exports = Router;

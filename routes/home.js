const express = require("express");
const Router = express.Router();
const passport = require("passport");
require("../utils/passport");

/************************JWt strategy */
Router.get("/", (req, res, next) => {
  console.log(req);

  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Token failed",
        connexion: user
      });
    }
    res
      .status(200)
      .json({ connexion: true, Message: "welcome to the Home page" });
  })(req, res, next);
});

module.exports = Router;

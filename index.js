const express = require("express");
const models = require("./models");
const authRoute = require("../back/routes/auth");
const homehRoute = require("../back/routes/home");
const app = express();
require("./utils/passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieSession = require("cookie-session");
const key = require("./utils/config");

const port = process.env.PORT || 3001;
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [key.session.cookiekey]
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));
var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-access-token"]
};
app.use(cors(corsOption));

app.use("/auth", authRoute);
app.use("/home", homehRoute);
models.sequelize.sync().then(() => {
  app.listen(port, () => console.log(`LISTENING ON PORT ${port}`));
});

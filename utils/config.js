module.exports = {
  jwt: {
    secret: "myscretkey"
  },
  session: {
    cookiekey: "f4qnvf5v2j18685fa84f3ad15kt2q0p2.apps.googleusercontent.com"
  },
  google: {
    clientID:
      "409252635899-f4qnvf5v2j18685fa84f3ad15kt2q0p2.apps.googleusercontent.com",
    clientSecret: "VZOvaOHZDnlf--mMB6ADIlyq",
    callbackURL: "/auth/google/redirect"
  },
  facebook: {
    clientID: "1736117719822046",
    clientSecret: "09ae7dfd4e9578a209db3c1c9f16b474",
    callbackURL: "/auth/facebook/redirect"
  }
};

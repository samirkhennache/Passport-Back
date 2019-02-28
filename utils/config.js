module.exports = {
  jwt: {
    secret: process.env.SECRET_KEY
  },
  session: {
    cookiekey: process.env.COOKIE_KEY
  },
  google: {
    // clientID:
    //   "409252635899-f4qnvf5v2j18685fa84f3ad15kt2q0p2.apps.googleusercontent.com",
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // clientSecret: "VZOvaOHZDnlf--mMB6ADIlyq",
    callbackURL: "/auth/google/redirect"
  },
  facebook: {
    // clientID: "1736117719822046",
    // clientSecret: "09ae7dfd4e9578a209db3c1c9f16b474",
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/redirect"
  }
};

/* eslint-env es6 */
/* eslint-disable no-console */
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
require("dotenv").config();

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        callbackURL: "https://jk-cb-asp-project2.herokuapp.com/auth/google/callback/"
    },
    (token, refreshToken, profile, done) => {
        return done(null, {
            profile: profile,
            token: token
        });
    }));
};
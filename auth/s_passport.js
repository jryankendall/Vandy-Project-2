require("dotenv").config();
var passport = require("passport");
var util = require("util");
var SteamStrategy = require("passport-steam").Strategy;
var PORT = process.env.PORT || 3000;
var Cookies = require("cookies");

var steamKey = process.env.STEAMKEY;
var myUrl = process.env.MYURL + ":" + PORT + "/";


passport.use(new SteamStrategy({
    returnURL: myUrl + "auth/steam/return",
    realm: myUrl,
    apiKey: steamKey
},
function(identifier, profile, done) {
    User.findByOpenID( { openid: identifier }, function(err, user) {
        return done(err, user);
    });
}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
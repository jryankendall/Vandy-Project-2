var db = require("../models");
require("dotenv").config();
var passport = require("passport");
var util = require("util");
var SteamStrategy = require("passport-steam").Strategy;
var PORT = process.env.PORT || 3000;

var steamKey = process.env.STEAMKEY;
var myUrl = process.env.MYURL + ":" + PORT + "/";


passport.use(new SteamStrategy({
    returnURL: myUrl + "auth/steam/return",
    realm: myUrl,
    profile: false,
    apiKey: steamKey
},
function(identifier, profile, done) {
    if (profile) {
        user = profile;
        return done(null, user);
    }
    else {
        return done(null, false);
    }
}
));

module.exports = function(app) {
    // Get all examples
    app.get("/api/examples", function(req, res) {
        db.Example.findAll({}).then(function(dbExamples) {
            res.json(dbExamples);
        });
    });

    // Create a new example
    app.post("/api/examples", function(req, res) {
        db.Example.create(req.body).then(function(dbExample) {
            res.json(dbExample);
        });
    });

    // Delete an example by id
    app.delete("/api/examples/:id", function(req, res) {
        db.Example.destroy({ where: { id: req.params.id } }).then(function(
            dbExample
        ) {
            res.json(dbExample);
        });
    });

    app.get("/auth/steam",
        passport.authenticate("steam"),
        function(req, res) {
            res.json(null);
        });

    app.get("/auth/steam/return",
        passport.authenticate("steam", { failureRedirect: "/login"}),
        function(req, res) {
            res.redirect("/");
        });
};

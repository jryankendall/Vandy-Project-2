var db = require("../models");
var request = require("request");
var APIkey = "B82D9F592F8EBCC4BD6130029F700D2B";

console.log("HTML routes loaded");


module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // console.log(db.appids);

        db.appids.findAll({
            attributes: ["appid", "name"],
            limit: 5
        }).then(function (dbGames) {
            console.log(dbGames[0]);

            res.render("index", {
                msg: "Games in the DB!",
                examples: dbGames
            });
        });
    });

    // Load example page and pass in an example by id
    app.get("/example/:appid", function (req, res) {
        db.appids.findOne({ where: { appid: req.params.appid } }).then(function (
            dbExample
        ) {
            res.render("example", {
                example: dbExample
            });
        });
    });

    // see if we get anything from the steam API
    app.get("/api/friends/:steamid", function (req, res) {
        var steamid = req.params.steamid;
        console.log("Making a request for friends of: " + steamid);
        var friendObj = getFriendsList(steamid);
        res.render("page_name", friendObj);
    });


    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        // console.log("this is the 404 page");
        // console.log("The URL you requested is: " + req.url);

        res.render("404");
    });

    // app.get("/friends")

};

// calls steam API to get friends list for specified user
var getFriendsList = function (steamid) {
    var options = {
        method: "GET",
        url: "https://api.steampowered.com/ISteamUser/GetFriendList/v1/",
        qs:
        {
            key: APIkey,
            steamid: steamid
        },
        headers:
        {
            "cache-control": "no-cache",
            Connection: "keep-alive",
            Host: "api.steampowered.com",
        }
    };
    // console.log(options);

    request(options, function (error, response, body) {
        if (error) { throw new Error(error); }
        // console.log(response);
        var data = JSON.parse(body);
        var friendslist = data.friendslist.friends;
        friendslist.forEach(function (element) {
            getPlayerSummary(element.steamid);
        });
    });
};

// displays info from Steam API about specified user
var getPlayerSummary = function (steamid) {
    var options = {
        method: "GET",
        url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
        qs:
        {
            key: APIkey,
            steamids: steamid
        },
        headers:
        {
            "cache-control": "no-cache"
        }
    };

    request(options, function (error, response, body) {
        if (error) { throw new Error(error); }
        var data = JSON.parse(body);
        var friendArr = data.response.players;
        var friendObj = data.response;
        friendArr.forEach(function (element) {
            console.log(element.personaname);
            console.log(element.steamid);
            console.log(element.profileurl);
            console.log(element.avatar);
        });
        return friendObj;
    });

};

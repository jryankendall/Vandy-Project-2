var db = require("../models");
var request = require("request");
var APIkey = "B82D9F592F8EBCC4BD6130029F700D2B";

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

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });

    // see if we get anything from the steam API
    app.get("/api/friends/:steamid", function (req, res) {
        console.log("Making a request for friends of: " + req.params.steamid);
        console.log(res);
        getFriendsList(req.params.steamid);
    });
};



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
            // "accept-encoding": "gzip, deflate",
            Host: "api.steampowered.com",
            // "Postman-Token": "2e625f9e-68f7-48be-8cab-829010d4dbf8,3b9112e3-42d1-42ed-bb10-cf0fb4e11a35",
            // "Cache-Control": "no-cache",
            // Accept: "*/*",
            // "User-Agent": "PostmanRuntime/7.11.0"
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
        var friend = data.response.players;
        friend.forEach(function (element) {
            console.log(element.personaname);
            console.log(element.steamid);
            console.log(element.profileurl);
            console.log(element.avatar);
        });
    });

};

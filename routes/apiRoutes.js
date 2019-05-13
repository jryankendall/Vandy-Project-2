var db = require("../models");
var axios = require("axios");
require("dotenv").config();

module.exports = function (app) {
    // create a new user profile
    app.post("/api/userdetails", function (req, res) {
        console.log(req.body);
        console.log(req.session.passport.user.profile.id);
        db.users.findOne({ where: { email: req.session.passport.user.profile.id } }).then(function (dbUserCheck) {
            if (!dbUserCheck) {
                res.redirect("/user");
            }
            else {
                db.users.findOne({ where: { username: req.body.username } }).then(function (dbUser) {
                    if (!dbUser) {
                        db.users.update(
                            { username: req.body.username, description: req.body.description },
                            { where: { email: req.session.passport.user.profile.id } })
                            .then(function () {
                                res.json({ success: "redirect" });
                            });
                    }
                    else {
                        res.json({ success: "username taken" });
                    }
                });
            }
        });
    });

    // Create a new user game
    app.post("/api/usergames", function (req, res) {
        // console.log(req.body);
        db.users.findOne({ where: { email: req.session.passport.user.profile.id } }).then(function (dbUser) {
            db.usergames.findOne({ where: { userId: dbUser.dataValues.id, gameId: req.body.gameId } }).then(function (dbUsergames) {
                if (!dbUsergames) {
                    req.body.userId = dbUser.dataValues.id;
                    db.usergames.create(req.body).then(function () {
                        res.json({ success: true });
                    });
                }
                else {
                    res.json({ success: false });
                }
            });
        });
    });

    // Create a new friend request
    app.post("/api/userfriends", function (req, res) {
        var userId2 = parseInt(req.body.userId2);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId1 = dbUsers.dataValues.id;
            console.log(userId1, userId2);
            db.userfriends.findOne({ where: { [db.Sequelize.Op.or]: [{ userId1: userId1, userId2: userId2 }, { userId1: userId2, userId2: userId1 }] } }).then(function (dbFriends) {
                if (!dbFriends) {
                    db.userfriends.create({ userId1: userId1, userId2: userId2 }).then(function () {
                        res.json({ success: true });
                    });
                }
                else {
                    res.json("Handle other shit here");
                }
            });
        });
    });

    // Confirm friend request
    app.post("/api/confirmfriend", function (req, res) {
        var userId1 = parseInt(req.body.userId1);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId2 = dbUsers.dataValues.id;
            console.log(userId1, userId2);

            db.userfriends.update(
                { status: 1 },
                { where: { userId1: userId1, userId2: userId2 } })
                .then(function () {
                    res.json("added");
                });
        });
    });

    // Delete friend
    app.delete("/api/deletefriend", function (req, res) {
        var userId2 = parseInt(req.body.userId2);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId1 = dbUsers.dataValues.id;
            console.log(userId1, userId2);

            db.userfriends.destroy(
                { where: { [db.Sequelize.Op.or]: [{ userId1: userId1, userId2: userId2, status: 1 }, { userId1: userId2, userId2: userId1, status: 1 }] } })
                .then(function () {
                    res.json("destroyed");
                });
        });
    });

    // Deny friend request
    app.delete("/api/denyfriend", function (req, res) {
        var userId1 = parseInt(req.body.userId1);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId2 = dbUsers.dataValues.id;
            console.log(userId1, userId2);

            db.userfriends.destroy(
                { where: { userId1: userId1, userId2: userId2, status: 0 } })
                .then(function () {
                    res.json("denied");
                });
        });
    });

    // Cancel friend request
    app.delete("/api/cancelfriend", function (req, res) {
        var userId2 = parseInt(req.body.userId2);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId1 = dbUsers.dataValues.id;
            console.log(userId1, userId2);

            db.userfriends.destroy(
                { where: { userId1: userId1, userId2: userId2, status: 0 } })
                .then(function () {
                    res.json("canceled");
                });
        });
    });

    // Remove Game from profile
    app.delete("/api/removegame", function (req, res) {
        var gameId = parseInt(req.body.gameId);
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: { email: sessionId } }).then(function (dbUsers) {
            var userId = dbUsers.dataValues.id;
            console.log(userId, gameId);
            db.usergames.destroy(
                { where: { userId: userId, gameId: gameId } })
                .then(function () {
                    res.json("removed");
                });
        });
    });

    // Search for users by name
    app.get("/api/person/search/:person", function (req, res) {
        var username = req.params.person;
        db.users.findOne({ where: { username: username } }).then(function (dbUsers) {
            if (!dbUsers) {
                res.json("User not found");
            }
            else {
                dbUsers.dataValues.email = "not passed";
                dbUsers.dataValues.createdAt = "not passed";
                dbUsers.dataValues.updatedAt = "not passed";
                res.json(dbUsers.dataValues);
            }
        });
    });

    // Get info on game from twitch
    app.get("/api/games/search/:game", function (req, res) {
        console.log("app.get called in apiRoutes");

        var game = req.params.game;
        var config = {
            url: "https://api.twitch.tv/helix/games",
            method: "get",
            headers: {
                "cache-control": "no-cache",
                Connection: "keep-alive",
                "accept-encoding": "gzip, deflate",
                Host: "api.twitch.tv",
                "Postman-Token": "48c59691-71ff-4f88-bd3e-fbc4da7d30b5,3d6a2e52-3883-4cc2-8ba2-e616c17e64b7",
                "Cache-Control": "no-cache",
                Accept: "*/*",
                "User-Agent": "PostmanRuntime/7.11.0",
                "Client-ID": process.env.TWITCHID
            },
            params: {
                name: game
            },
        };

        // Data leech, searches for game in database, if not found get the game from twitch and store it in database
        function findGame(check, obj) {
            db.appids.findOne({ where: { name: game } }).then(function (dbUsers) {
                if (!dbUsers) {
                    console.log("Game does not exist in database, searching twitch...");
                    axios(config)
                        .then(function (data) {
                            var newGames = data.data;
                            if (newGames.data.length > 0 && !check) {
                                // Double check required as a name like "wow" returns "world of warcraft".
                                db.appids.findOne({ where: { name: newGames.data[0].name } }).then(function (dbUsersDoubleCheck) {
                                    if (dbUsersDoubleCheck) {
                                        console.log("Different input name than twitch name matched. Insertion prevented");
                                        res.json(dbUsersDoubleCheck.dataValues);
                                    }
                                    else {
                                        db.appids.create({
                                            appid: newGames.data[0].id,
                                            name: newGames.data[0].name,
                                            image: newGames.data[0].box_art_url.replace(/-{width}x{height}/g, "")
                                        }).then(function () {
                                            findGame(1, newGames.data[0]);
                                        });
                                    }
                                });
                            }
                            else if (check === 1) {
                                console.log(obj);
                                console.log("Game successfully added to and pulled from database");
                                res.json(obj);
                            }
                            else { //add better error handling for invalid searches
                                console.log("Game does not exist on twitch");
                            }
                        });
                }
                else if (check > 0) {
                    console.log("Game successfully added to and pulled from database");
                    res.json(dbUsers.dataValues);
                }
                else {
                    console.log("Found in database, twitch api not used!");
                    res.json(dbUsers.dataValues);
                }
            });
        }
        findGame(0, {});
    });

    // app to get full list of games in DB    
    app.get("/api/allgames", function (req, res) {
        db.appids.findAll({}).then(function (dbGames) {
            res.json(dbGames);
        });

    });

    // Get stream info from Twitch for selected game
    app.get("/api/getstreams/:appid", function (req, res) {
        var appid = req.params.appid;
        console.log(appid);
        
        var config = {
            url: "https://api.twitch.tv/helix/clips",
            method: "get",
            headers: {
                "cache-control": "no-cache",
                Connection: "keep-alive",
                Host: "api.twitch.tv",
                "Client-ID": process.env.TWITCHID
            },
            params:
            {
                game_id: appid, // eslint-disable-line camelcase
                first: 2
            }
        };

        axios(config)
            .then(function (data) {
                console.log(data.data.data);
                res.json(data.data.data);
            });
    });
};

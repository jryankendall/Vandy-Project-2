var db = require("../models");
var axios = require("axios");

module.exports = function (app) {
    // Get all examples
    app.get("/api/examples", function (req, res) {
        db.Example.findAll({}).then(function (dbExamples) {
            res.json(dbExamples);
        });
    });

    app.post("/api/userdetails",function (req, res) {
        console.log(req.body);
        console.log(req.session.passport.user.profile.id);
        db.users.findOne({ where: {email: req.session.passport.user.profile.id} }).then(function(dbUserCheck){
            if(!dbUserCheck){
                res.redirect("/user");
            }
            else{
                db.users.findOne({ where: {username: req.body.username} }).then(function(dbUser){
                    if(!dbUser){
                        db.users.update(
                            {username: req.body.username, description: req.body.description},
                            {where: {email: req.session.passport.user.profile.id}})
                            .then(function () {
                                res.json({success: "redirect"});
                            });
                    }
                    else{
                        res.json({success: "username taken"});
                    }
                });
            }
        });
    });

    // Create a new example
    app.post("/api/usergames", function (req, res) {
        console.log(req.body);
        db.users.findOne({ where: { email: req.session.passport.user.profile.id } }).then(function (dbUser) {
            //console.log(dbUser.dataValues.id);
            //res.json({dbUser});
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
        
        /*(db.usergames.create(req.body).then(function (dbExample) {
            res.json(dbExample);
        });*/
    });

    app.post("/api/userfriends", function (req, res) {
        var userId2 = req.body.userId2;
        var sessionId = req.session.passport.user.profile.id;
        db.users.findOne({ where: {email: sessionId} }).then(function(dbUsers){
            var userId1 = dbUsers.dataValues.id;
            console.log(userId1,userId2);
            db.userfirends.findOne({ where: {[Op.or]: [{userId1: userId1, userId2: userId2}, {userId1: userId2, userId2: userId1}]} }).then(function(dbFriends){
                if(!dbFriends){
                    res.json("Should add friends here");
                }
                else{
                    res.json("Handle other shit here");
                }
            });
        });
        // function to add user to friends list ... first checking that friend doesn't exist
        
    });

    // Delete an example by id
    app.delete("/api/examples/:id", function (req, res) {
        db.Example.destroy({ where: { id: req.params.id } }).then(function (
            dbExample
        ) {
            res.json(dbExample);
        });
    });

    app.get("/api/person/search/:person", function (req, res){
        var username = req.params.person;
        db.users.findOne({ where: { username: username } }).then(function (dbUsers) {
            if(!dbUsers){
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

    // get info on game from twitch
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
                "Client-ID": "we8zo2mrneam0abyl6ygvjrn577c1i"
            },
            params: {
                name: game
            },
        };
        function findGame(check, obj) {
            db.appids.findOne({ where: { name: game } }).then(function (dbUsers) {
                if (!dbUsers) {
                    console.log("Game does not exist in database, searching twitch...");
                    axios(config)
                        .then(function (data) {
                            var newGames = data.data;
                            if (newGames.data.length > 0 && !check) {
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



// app to get latest streams for top games ... implement later    
//     app.get("/api/news", function (req, res) {
//         console.log("app.get news called in apiRoutes");
//         var $clipsArr = [];
//         var config = {
//             url: "https://api.twitch.tv/helix/games/top",
//             method: "get",
//             headers: {
//                 "cache-control": "no-cache",
//                 Connection: "keep-alive",
//                 Host: "api.twitch.tv",
//                 "Client-ID": "we8zo2mrneam0abyl6ygvjrn577c1i"
//             },
//             params:
//             {
//                 first: 3
//             }
//         };

//         console.log("searching twitch for top games...");

//         axios(config)
//             .then(function (data) {
//                 var $news = data.data.data;
//                 console.log("Top games from twitch");

//                 // console.log($news);

//                 for (var i = 0; i < $news.length; i++) {
//                     console.log("Game " + i + " : " + $news[i].name);

//                     var config = {
//                         url: "https://api.twitch.tv/helix/clips",
//                         method: "get",
//                         headers: {
//                             "cache-control": "no-cache",
//                             Connection: "keep-alive",
//                             Host: "api.twitch.tv",
//                             "Client-ID": "we8zo2mrneam0abyl6ygvjrn577c1i"
//                         },
//                         params:
//                         {
//                             game_id: $news[i].id,
//                             first: 1
//                         }
//                     };
//                     axios(config)
//                         .then(function (data) {
//                             var $clips = data.data.data;
//                             $clipsArr.push($clips[0]);
//                             console.log($clipsArr);
//                             res.json($clipsArr);
//                         });
//                 }
//             });
//     });
};
var db = require("../models");
var passport = require("passport");


module.exports = function(app) {

    app.get("/authtest", (req, res) => {
        //will need to add more stuff to this, placeholder for now
        
        
        if (req.session.token) {
            res.cookie("token", req.session.token);
            res.json({
                status: "session cookie set"
            });
            
        } else {
            res.cookie("token", "");
            res.json({
                status: "session cookie not set"
            });
        }

    });

    app.get("/logout", (req, res) => {
        
        req.logout();
        req.session = null;
        res.redirect("/");
    });

    // Load index page
    app.get("/", function(req, res) {
        // console.log(db.appids);
        
        db.appids.findAll({
            attributes: ["appid", "name"],
            limit: 5
        }).then(function(dbGames) {
            console.log(dbGames[0]);
            
            res.render("index", {
                msg: "Games in the DB!",
                examples: dbGames
            });
        });
    });
    
    //Authentication URL
    app.get("/auth/google", passport.authenticate("google", {
        scope: ["https://www.googleapis.com/auth/userinfo.profile"]
    }));

    //Return after auth URL
    app.get("/auth/google/callback",
        passport.authenticate("google", {
            failureRedirect: "/authtest"
        }),
        (req, res) => {
            req.session.token = req.user.token;
            //console.log(req.user);
            
            res.redirect("/user");
            console.log("           redirected             ");
        }
    );

    // Load example page and pass in an example by id
    /*app.get("/example/:appid", function(req, res) {
        db.appids.findOne({ where: { appid: req.params.appid } }).then(function(
            dbExample
        ) {
            res.render("example", {
                example: dbExample
            });
        });
    });*/

    app.get("/user", function(req,res){
        console.log(Object.keys(req.session));
        if(Object.keys(req.session).length===1){
            res.redirect("/auth/google");
        }
        else {
            var sessionId = req.session.passport.user.profile.id;
            var sessionImage = req.session.passport.user.profile.photos[0].value;
            db.users.findOne({ where: {email: sessionId} }).then(function(dbUsers){
                if(!dbUsers){
                    db.users.create({email: sessionId,image: sessionImage}).then(function () {
                        console.log("Account added to database. Redirecting to account creation...");
                        res.redirect("/createAccount");
                    });
                }
                else if(!dbUsers.dataValues.username || !dbUsers.dataValues.description){
                    console.log("Account details not complete. Redirecting to account creation...");
                    res.redirect("/createAccount");
                }
                else {
                    
                    // Get user Games
                    db.sequelize.query("select appids.id, appid, name, image from appids"+
                    " join usergames"+
                    " on usergames.gameId = appids.id"+
                    " where usergames.userId = ?;",
                    { replacements: [dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
                    ).then(function(projects) {

                        dbUsers.dataValues.games = projects;

                        //Get user Friends
                        db.sequelize.query("select users.username as friends,status,users.id from users"+
                        " join userfriends"+
                        " on userfriends.userId1 = users.id"+
                        " or userfriends.userId2 = users.id"+
                        " where users.id != ? AND (userfriends.userId1 = ? or userfriends.userId2 = ?) AND userfriends.status = 1"+
                        " group by users.username;",
                        { replacements: [dbUsers.dataValues.id,dbUsers.dataValues.id,dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
                        ).then(function(friends) {

                            dbUsers.dataValues.friends = friends;
                            dbUsers.dataValues.friendsLen = friends.length;
                            if(friends.length > 0){
                                for(var i = 0; i < friends.length; i++){
                                    db.sequelize.query("select appids.id, appid, name, image from appids"+
                                    " join usergames"+
                                    " on usergames.gameId = appids.id"+
                                    " where usergames.userId = ?;",
                                    { replacements: [dbUsers.dataValues.friends[i].id], type: db.sequelize.QueryTypes.SELECT }
                                    ).then(function(projects) {
                                        //dbUsers.dataValues.friends[i]
                                        console.log(projects);
                                    });
                                }
                            }
                            db.sequelize.query("select appids.id, appid, name, image from appids"+
                            " join usergames"+
                            " on usergames.gameId = appids.id"+
                            " where usergames.userId = ?;",
                            { replacements: [dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
                            ).then(function(projects) {

                            //Get user pending out
                            db.sequelize.query("select users.username as friendsOut,status,users.id from users"+
                            " join userfriends"+
                            " on userfriends.userId1 = users.id"+
                            " or userfriends.userId2 = users.id"+
                            " where users.id != ? AND (userfriends.userId1 = ?) AND userfriends.status = 0"+
                            " group by users.username;",
                            { replacements: [dbUsers.dataValues.id,dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
                            ).then(function(friendsOut) {

                                dbUsers.dataValues.friendsOut = friendsOut;
                                dbUsers.dataValues.friendsOutLen = friendsOut.length;

                                //Get user pending in
                                db.sequelize.query("select users.username as friendsIn,status,users.id from users"+
                                " join userfriends"+
                                " on userfriends.userId1 = users.id"+
                                " or userfriends.userId2 = users.id"+
                                " where users.id != ? AND (userfriends.userId2 = ?) AND userfriends.status = 0"+
                                " group by users.username;",
                                { replacements: [dbUsers.dataValues.id,dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
                                ).then(function(friendsIn) {

                                    dbUsers.dataValues.friendsIn = friendsIn;
                                    dbUsers.dataValues.friendsInLen = friendsIn.length;

                                    console.log(dbUsers.dataValues);
                                    res.render("user",{
                                        image: dbUsers.dataValues.image,
                                        username: dbUsers.dataValues.username,
                                        description: dbUsers.dataValues.description,
                                        games: dbUsers.dataValues.games,
                                        friends: dbUsers.dataValues.friends,
                                        friendsOut: dbUsers.dataValues.friendsOut,
                                        friendsIn: dbUsers.dataValues.friendsIn,
                                        friendsLen: dbUsers.dataValues.friendsLen,
                                        friendsOutLen: dbUsers.dataValues.friendsOutLen,
                                        friendsInLen: dbUsers.dataValues.friendsInLen
                                    });
                                });
                            });
                        });
                    });  
                    //});
                }
            });
            /*res.render("user",{

            });*/
        }
    });

    /*app.get("/api/user/:val", function(req, res){
        console.log(req.params.val);
        db.users.findOne({ where: {email: req.params.val} }).then(function(dbUsers){
            db.sequelize.query("select appids.id, appid, name, image from appids"+
            " join usergames"+
            " on usergames.gameId = appids.id"+
            " where usergames.userId = ?;",
            { replacements: [dbUsers.dataValues.id], type: db.sequelize.QueryTypes.SELECT }
            ).then(function(projects) {
                dbUsers.dataValues.games = projects;
                console.log(dbUsers.dataValues);
                // console.log("Db users after parse", typeof dbUsers.dataValues);
                res.json(dbUsers.dataValues);
            });  
        });
    });*/

    app.get("/createAccount", function(req,res){
        if(Object.keys(req.session).length===1){
            res.redirect("/auth/google");
        }
        else{
            var sessionId = req.session.passport.user.profile.id;
            
            db.users.findOne({ where: {email: sessionId} }).then(function(dbUsers){
                if(dbUsers.dataValues.username && dbUsers.dataValues.description){
                    res.redirect("/");
                }
                else {
                    //console.log("Account details not complete. Redirecting to account creation...");
                    res.render("createAccount");
                }
            });
        }
        
    });

    // Render 404 page for any unmatched routes
    app.get("*", function(req, res) {
        res.render("404");
    });
};

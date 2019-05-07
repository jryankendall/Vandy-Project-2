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
        res.redirect("/authtest");
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
            console.log(req.user);
            
            res.redirect("/authtest");
        }
    );

    // Load example page and pass in an example by id
    app.get("/example/:appid", function(req, res) {
        db.appids.findOne({ where: { appid: req.params.appid } }).then(function(
            dbExample
        ) {
            res.render("example", {
                example: dbExample
            });
        });
    });

    app.get("/user", function(req,res){
        if(req.isAuthenticated()){
            console.log(req);
            res.render("user");
        }
        else {
            res.redirect("/");
        }
    });

    app.get("/api/user/:val", function(req, res){
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
    });

    app.get("/createAccount", function(req,res){
        res.render("createAccount");
    });

    // Render 404 page for any unmatched routes
    app.get("*", function(req, res) {
        res.render("404");
    });
};

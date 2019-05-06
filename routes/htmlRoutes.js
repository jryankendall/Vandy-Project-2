var db = require("../models");

module.exports = function(app) {
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
        res.render("user");
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

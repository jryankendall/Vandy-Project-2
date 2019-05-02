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

    // Render 404 page for any unmatched routes
    app.get("*", function(req, res) {
        res.render("404");
    });
};

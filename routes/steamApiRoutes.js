// var db = require("../models");
/*
module.exports = function(app) {
    // Get all examples
    app.get("/api/examples", function(req, res) {
        db.appids.findAll({
            attributes: ["appid", "name"],
            limit: 5
        }).then(function(dbGames) {
            res.json(dbGames);
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
};
*/
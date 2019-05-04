var db = require("../models");
var axios = require("axios");

module.exports = function (app) {
    // Get all examples
    app.get("/api/examples", function (req, res) {
        db.Example.findAll({}).then(function (dbExamples) {
            res.json(dbExamples);
        });
    });

    // Create a new example
    app.post("/api/examples", function (req, res) {
        db.Example.create(req.body).then(function (dbExample) {
            res.json(dbExample);
        });
    });

    // Delete an example by id
    app.delete("/api/examples/:id", function (req, res) {
        db.Example.destroy({ where: { id: req.params.id } }).then(function (
            dbExample
        ) {
            res.json(dbExample);
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

        axios(config)
            .then(function (data) {
                var newGames = data.data
                console.log(newGames);
                res.json(newGames);
            });
    });
};

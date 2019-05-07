// Get references to page elements
var $searchResults = $("#search-results");
var $searchBtn = $("#search-btn");
var $loginBtn = $("#login");

// The API object contains methods for each kind of request we'll make
var API = {
    searchGame: function (game) {
        return $.ajax({
            url: "api/games/search/" + game,
            type: "GET"
        });
    }
};

// handle the search button
var handleFormSearch = function (event) {
    event.preventDefault();

    var game = $("#game-search").val().trim();

    if (!(game)) {
        alert("You must enter a game name!");
        return;
    }

    API.searchGame(game).then(function (data) {
        //call function to do something with API data
        //console.log(data);
        displaySearchResults(data);
    });
};

var displaySearchResults = function (data) {

    // build the card for each game returned
    var $games = [data].map(function (game) {

        //console.log(game.name);
        var $card = $("<div>")
            .addClass("card")
            .width("10rem");

        var image = "";

        if (!game.image) {
            image = game.box_art_url.replace(/-{width}x{height}/g, "");
        }
        else {
            image = game.image;
        }

        console.log(image);

        var $img = $("<img>")
            .attr("src", image)
            .addClass("card-img-top");
        var $cardbody = $("<div>");
        var $title = $("<h5>")
            .addClass("card-title pl-1")
            .text(game.name);
        var $addBtn = $("<button>")
            .addClass("btn btn-success btn-sm btn-block add")
            .attr("href", "#")
            .text("+ Add game")
            .attr("id", game.id);
        $card
            .append($img)
            .append($cardbody)
            .append($title)
            .append($addBtn);

        return $card;

    });
    $searchResults.empty();
    $searchResults.append("Search results" + "<hr>");
    $searchResults.append($games);
    $searchResults.append("<hr>");
};

var handleLogin = function (e) {
    $("#games").empty();
    e.preventDefault();
    console.log("pressed");
    console.log($("#inputEmail").val());
    return $.ajax({
        url: "api/user/" + $("#inputEmail").val().trim(),
        type: "GET"
    }).then(function (user) {
        console.log("DER USER", user);
        $("#username").text(user.username)
            .attr("data-id", user.id);
        $("#description").text(user.description);
        for (var i = 0; i < user.games.length; i++) {
            $("#games").append("<h2>" + user.games[i].name + "<h2>")
                .append("<img src=" + user.games[i].image + "height=200 width=150>");
        }
    });
};

var handleAdd = function () {
    userId = $("#username").attr("data-id");
    if (userId) {//Not secure!!! Change when authentication works
        return $.ajax({
            headers: {
                "Content-Type": "application/json"
            },
            type: "POST",
            url: "api/usergames",
            data: JSON.stringify({ userId: userId, gameId: this.id })
        }).then(function (res) {
            console.log(res);
        });
    }
    else {
        console.log("Please login to add games");
    }
};

// Add event listeners to the submit and delete buttons
$searchBtn.on("click", handleFormSearch);
$loginBtn.on("click", handleLogin);
$(document).on("click", ".add", handleAdd);
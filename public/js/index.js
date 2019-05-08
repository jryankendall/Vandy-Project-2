// Get references to page elements
var $searchResults = $("#search-results");
var $searchBtn = $("#search-btn");
var $personBtn = $("#person-btn");

// var $loginBtn = $("#login");
// var $userGames = $("#games");
// var $userGames2 = $("#games2");

// The API object contains methods for each kind of request we'll make
var API = {
    searchGame: function (game) {
        return $.ajax({
            url: "api/games/search/" + game,
            type: "GET"
        });
    },

    searchPerson: function(person){
        return $.ajax({
            url: "api/person/search/" + person,
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

// handle the search button
var handlePersonSearch = function (event) {
    event.preventDefault();

    var person = $("#person-search").val().trim();
    console.log(person);
    if (!(person)) {
        alert("You must enter a person's username!");
        return;
    }

    API.searchPerson(person).then(function (data) {

        //call function to do something with API data
        console.log("made it this far");
        //displaySearchResults(data);
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

// var handleLogin = function (e) {
//     e.preventDefault();
//     console.log("pressed");
//     /*console.log($("#inputEmail").val());
//     var $email = $("#inputEmail").val().trim();
//     localStorage.setItem("userEmail", $email);
//     refreshLogin($email);*/
// };

// @Chris -- Move what you can to handle bars
// var refreshLogin = function () {

//     // create a card for games in library
//     var $games = user.games.map(function (game) {
//         var $card = $("<div>")
//             .addClass("card mb-2")
//             .width("10rem");
//         var cardCol = $("<div>")
//             .addClass("col");

//         var image = "";

//         if (!game.image) {
//             image = game.box_art_url.replace(/-{width}x{height}/g, "");
//         }
//         else {
//             image = game.image;
//         }
//         var $img = $("<img>")
//             .attr("src", image)
//             .addClass("card-img-top");
//         var $title = $("<h5>")
//             .addClass("card-title pl-1")
//             .text(game.name);

//         $card
//             .append($img)
//             .append($title);
//         cardCol.append($card);
//         return cardCol;

//     });
//     $userGames.empty();
//     $userGames.append(user.username + "'s games" + "<hr>");
//     $userGames2.empty();
//     $userGames2.append($games);

// };

var handleAdd = function () {

    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/usergames",
        data: JSON.stringify({gameId: this.id })
    }).then(function (res) {
        //console.log(res);
        $searchResults.empty();
        if(res.success){
            location.reload();
        }
        else{
            $searchResults.append("This game is already on your list.");
        }
        
        //var $email = localStorage.getItem("userEmail");
        //refreshLogin();
    });

};

// Add event listeners to the submit and delete buttons
$searchBtn.on("click", handleFormSearch);
$personBtn.on("click", handlePersonSearch);
// $loginBtn.on("click", handleLogin);
$(document).on("click", ".add", handleAdd);

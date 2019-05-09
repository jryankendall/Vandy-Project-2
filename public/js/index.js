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

    searchPerson: function (person) {
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
    //console.log(person);
    if (!(person)) {
        alert("You must enter a person's username!");
        return;
    }

    API.searchPerson(person).then(function (data) {

        //call function to do something with API data
        console.log(data);
        displayPersonSearch(data);
    });
};

var displayPersonSearch = function (user) {

    // builds the user card and has an add button
    var $card = $("<div>")
        .addClass("card")
        .width("10rem");
    var $img = $("<img>")
        .attr("src", user.image)
        .addClass("card-img-top");
    var $cardbody = $("<div>")
        .addClass("card-body");
    var $title = $("<h5>")
        .addClass("card-title")
        .text(user.username);
    var $body = $("<p>")
        .addClass("card-text")
        .text(user.description);
    var $addBtn = $("<button>")
        .addClass("btn btn-success btn-sm btn-block add-friend")
        .attr("href", "#")
        .text("+ Add friend")
        .attr("id", user.id);

    $cardbody
        .append($title)
        .append($body);

    $card
        .append($img)
        .append($cardbody)
        .append($addBtn);

    // call the render function
    renderResults($card);
};

var displaySearchResults = function (data) {

    // build the card for each game returned
    var $games = [data].map(function (game) {

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
            .addClass("btn btn-success btn-sm btn-block add-game")
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
    // call render function
    renderResults($games);
};

// render whatever html is passed to the $searchResults area
var renderResults = function ($item) {
    $searchResults.empty();
    $searchResults.append("<hr>Search results</h3>" + "<hr>");
    $searchResults.append($item);
    $searchResults.append("<hr>");
};

// this handles the addGame button click
var handleAddGame = function () {

    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/usergames",
        data: JSON.stringify({ gameId: this.id })
    }).then(function (res) {
        //console.log(res);
        $searchResults.empty();
        if (res.success) {
            location.reload();
        }
        else {
            $searchResults.append("This game is already on your list.");
        }
    });
};

var handleAddFriend = function () {

    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/userfriends",
        data: JSON.stringify({ userId2: this.id })
    }).then(function (res) {
        console.log(res);
        $searchResults.empty();
        if (res.success) {
            location.reload();
        }
        else {
            $searchResults.append("This user is already in your friends list.");
        }
    });
};

//Button function for confirming a friend
function handleConfirmFriend(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/confirmfriend",
        data: JSON.stringify({ userId1: $(btn).attr("data-id") })
    }).then(function (res) {
        console.log(res);
        $("#friendslist")
            .append("<p>")
            .append("<strong>" + $(btn).attr("id") + " ")
            .append("<button class='badge badge-danger' onclick='handleDeleteFriend(this)' data-id="+ $(btn).attr("data-id") +">Delete</button>");
        $(btn).parent().remove();
    });
}

function handleDenyFriend(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "DELETE",
        url: "api/denyfriend",
        data: JSON.stringify({ userId1: $(btn).attr("data-id") })
    }).then(function (res) {
        console.log(res);
        $(btn).parent().remove();
    });
}

function handleCancelFriend(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "DELETE",
        url: "api/cancelfriend",
        data: JSON.stringify({ userId2: $(btn).attr("data-id") })
    }).then(function (res) {
        console.log(res);
        $(btn).parent().remove();
    });
}

// Button function for deleting a friend
function handleDeleteFriend(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "DELETE",
        url: "api/deletefriend",
        data: JSON.stringify({ userId2: $(btn).attr("data-id") })
    }).then(function (res) {
        console.log(res);
        $(btn).parent().remove();
    });
}

function handleRemoveGame(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "DELETE",
        url: "api/removegame",
        data: JSON.stringify({ gameId: $(btn).attr("data-id") })
    }).then(function (res) {
        console.log(res);
        $(btn).parent().parent().remove();
    });
}


// Add event listeners to the submit and delete buttons
$searchBtn.on("click", handleFormSearch);
$personBtn.on("click", handlePersonSearch);
$(document).on("click", ".add-game", handleAddGame);
$(document).on("click", ".add-friend", handleAddFriend);
//$(document).on("click", ".confirm", handleConfirmFriend);
//$(document).on("click", ".deny", handleDenyFriend);
//$(document).on("click", ".cancel", handleCancelFriend);
//$(document).on("click", ".delete", handleDeleteFriend);


// Get references to page elements
var $searchResults = $("#search-results");
var $searchBtn = $("#search-btn");
var $personBtn = $("#person-btn");
var $streamArea = $("#stream-area");

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

// handle the game search button
var handleFormSearch = function (event) {
    event.preventDefault();

    var game = $("#game-search").val().trim();

    if (!(game)) {
        alert("You must enter a game name!");
        return;
    }

    API.searchGame(game).then(function (data) {
        displaySearchResults(data);
    });
};

// handle the person search button
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
        if (data === "User not found") {
            $searchResults.empty();
            $searchResults.append(data);
        }
        else {
            displayPersonSearch(data);
        }

    });
};

// Function for displaying a searched user
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
        .addClass("btn btn-success btn-sm btn-block")
        .attr("href", "#")
        .text("+ Add friend")
        .attr("id", user.id)
        .attr("onclick", "handleAddFriend(this)");

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

// Function for displaying a searched game
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

        var $img = $("<img>")
            .attr("src", image)
            .addClass("card-img-top");
        var $cardbody = $("<div>");
        var $title = $("<h5>")
            .addClass("card-title pl-1")
            .text(game.name);
        var $addBtn = $("<button>")
            .addClass("btn btn-success btn-sm btn-block")
            //.attr("href", "#")
            .text("+ Add game")
            .attr("id", game.id)
            .attr("data-id", 0)
            .attr("onclick", "handleAddGame(this)");
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
function handleAddGame(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/usergames",
        data: JSON.stringify({ gameId: $(btn).attr("id") })
    }).then(function (res) {
        if (res.success) {
            location.reload();
        }
        else {
            $searchResults.append("This game is already on your list.");
        }
    });
}

// Button function for adding a friend
function handleAddFriend(btn) {
    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: "api/userfriends",
        data: JSON.stringify({ userId2: $(btn).attr("id") })
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
}

// Button function for confirming a friend
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
            .append("<button class='badge badge-danger' onclick='handleDeleteFriend(this)' data-id=" + $(btn).attr("data-id") + ">Delete</button>");
        $(btn).parent().remove();
    });
}

// Button function for denying an incoming friend request
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

// Button function for canceling an outgoing friend request
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

// Button function for removing a game from profile
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
        location.reload();
    });
}

function handleStreams(btn) {
    var appid = $(btn).attr("data-id");
    console.log("handleStreams called with appid", appid);

    return $.ajax({
        headers: {
            "Content-Type": "application/json"
        },
        type: "GET",
        url: "api/getstreams/" + appid
    }).then(function (res) {
        console.log("response from API call");
        // console.log(res);
        showStreams(res);
    });
}

// Adds streams to modal
function showStreams(streamsArr) {
    console.log(streamsArr);
    
    $streamArea
        .empty();

    for (var i = 0; i < streamsArr.length; i++) {
        // build a row with columns of iframes inside

        var $stream = $("<div>")
            .addClass("col");

        var $title = $("<h6>")
            .text(streamsArr[i].title)
            .addClass("mt-3");

        var $iframe = $("<iframe>")
            .attr("id", streamsArr[i].id)
            .attr("width", "420")
            .attr("height", "315")
            .attr("src", streamsArr[i].embed_url + "&autoplay=false");

        $stream
            .append($title)
            .append($iframe);

        $streamArea
            .append($stream);
    }
}

// Add event listeners to buttons
$searchBtn.on("click", handleFormSearch);
$personBtn.on("click", handlePersonSearch);
$(document).on("click", ".add-friend", handleAddFriend);
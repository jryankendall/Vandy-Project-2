// Get references to page elements
var $exampleText = $("#example-text");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");
var $exampleList = $("#example-list");
var $searchResults = $("#search-results");
var $searchBtn = $("#search-btn");
var $button = $("<button>");

// The API object contains methods for each kind of request we'll make
var API = {
    saveExample: function (example) {
        return $.ajax({
            headers: {
                "Content-Type": "application/json"
            },
            type: "POST",
            url: "api/examples",
            data: JSON.stringify(example)
        });
    },
    getExamples: function () {
        return $.ajax({
            url: "api/examples",
            type: "GET"
        });
    },
    deleteExample: function (id) {
        return $.ajax({
            url: "api/examples/" + id,
            type: "DELETE"
        });
    },
    searchGame: function (game) {
        return $.ajax({
            url: "api/games/search/" + game,
            type: "GET"
        });
    }
};

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function () {
    API.getExamples().then(function (data) {
        var $examples = data.map(function (example) {
            var $a = $("<a>")
                .text(example.text)
                .attr("href", "/example/" + example.id);

            var $li = $("<li>")
                .attr({
                    class: "list-group-item",
                    "data-id": example.id
                })
                .append($a);

            var $button = $("<button>")
                .addClass("btn btn-danger float-right delete")
                .text("ｘ");

            $li.append($button);

            return $li;
        });

        $exampleList.empty();
        $exampleList.append($examples);
    });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function (event) {
    event.preventDefault();

    var example = {
        text: $exampleText.val().trim(),
        description: $exampleDescription.val().trim()
    };

    if (!(example.text && example.description)) {
        alert("You must enter an example text and description!");
        return;
    }

    API.saveExample(example).then(function () {
        refreshExamples();
    });

    $exampleText.val("");
    $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function () {
    var idToDelete = $(this)
        .parent()
        .attr("data-id");

    API.deleteExample(idToDelete).then(function () {
        refreshExamples();
    });
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
    //console.log(data);
    //console.log(data.data);
    
    var $games = [data].map(function (game) {
        console.log(game);
        var $a = $("<a>")
            .text(game.name)
            .attr("href", "/games/" + game.id);

        var image = "";

        if(!game.image){
            image = game.box_art_url.replace(/-{width}x{height}/g, "");
        }
        else {
            image = game.image;
        }

        console.log(image);
        var img = $("<img>")
            .attr("src",image)
            .attr("height","200")
            .attr("width","150");
        //console.log(img);

        
        var $li = $("<li>")
            .attr({
                class: "list-group-item",
                "data-id": game.id,
                "data-name": game.name
            })
            .append($a)
            .append(img);

        $button
            .addClass("btn btn-success float-right add")
            .attr("id", game.id)
            .text("+");

        $li.append($button);

        return $li;
    });
    $searchResults.empty();
    $searchResults.append("Search results" + "<hr>");
    $searchResults.append($games);
    $searchResults.append("<hr>");
    
};

// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
$exampleList.on("click", ".delete", handleDeleteBtnClick);
$searchBtn.on("click", handleFormSearch);
$button.on("click",function(){
    userId = $("#username").attr("data-id");
    if(userId){//Not secure!!! Change when authentication works
        return $.ajax({
            headers: {
                "Content-Type": "application/json"
            },
            type: "POST",
            url: "api/usergames",
            data: JSON.stringify({userId: userId, gameId: this.id})
        }).then(function(res){
            console.log(res);
        });
    }
    else{
        console.log("Please login to add games");
    }
});
$( document ).ready(function() {
    console.log( "ready!" );
    var $news = $("news-feed");

    var API = {
        getAllGames: function () {
            return $.ajax({
                url: "api/allgames/",
                type: "GET"
            });
        }
    };

    API.getAllGames().then(function(data) {
        console.log(data);
    });
});
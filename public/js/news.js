$( document ).ready(function() {
    console.log( "ready!" );
    var $news = $("news-feed");

    var API = {
        getNews: function () {
            return $.ajax({
                url: "api/news/",
                type: "GET"
            });
        }
    };

    API.getNews().then(function(data) {
        console.log(data);
    });
});
//This requires moment.js to be loaded BEFORE this js file, on the html with the script tag.
//CDN Link for it: https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js

moment().format();

//appnews is the response.appnews received by the steamnews API
var NewsObject = function(appnews) {
    this.appid = appnews.appid;
    this.newsitems = appnews.newsitems;
    this.printNews = function() {
        var articleCount = 5;
        if (this.count < 5) {
            articleCount = this.count;
        }
        for (var i = 0; i < articleCount; i++) {
            //Prints the most recent 5 articles for the app, or all of them if there's fewer than 5
            var newsItem = this.newsItems[i];
            var itemDiv = $("<div>");
            itemDiv.attr("id", "news-" + i + "-container"); //Sets each newsitem's containing div to have an id of 'news-i-container' where i is its index in the newsitems array

            var titleDiv = $("<div>");
            var titleLink = $("<a>");
            titleLink.attr("href", newsItem.url).attr("target", "_blank"); //opens full news article in new tab
            var titleText = $("<h3>");
            titleText.text(newsItem.title);
            titleLink.append(titleText);
            titleDiv.append(titleLink);
            titleDiv.append("<p>Source: " + newsItem.feedlabel + "</p>");
            var articleTime = moment(newsItem.date);
            var parsedTime = articleTime.format("MMM Do YYYY");
            titleDiv.append("<p>Posted: " + parsedTime + "</p>");

            var contentsDiv = $("<div>");
            contentsDiv.attr("id", "news-" + i + "-contents"); //Sets the div containing the article content itself to have id of 'news-i-contents' in case its needed.
            contentsDiv.html(newsItem.contents);

            itemDiv.append(titleDiv).append(contentsDiv);
            $("#newsfeed-div").append(itemDiv); //the div with the id #newsfeed-div will need to be put into the html by the front end developer
        }
    };
};

//This is just so eslint stops throwing a fit about unused variables, despite the fact it's a #@*$! constructor to be used in a different file. whatever.
var testNews = new NewsObject( {
    appid: 69,
    newsItems: [{
        url: "ACK",
        title: "It is what it is",
        feedlabel: "nowhere",
        date: 500,
        contents: "BEHOLD! Article would go here."
    }],
    count: 1
});

console.log(testNews);


//In the page Ajax logic (load AFTER this file), the API call will be expecting the appnews object from the back-end API, and will construct a new NewsObject with it, then execute the NewsObject.printNews() function
//Well, it should, assuming I wrote it. If you're writing it, just make sure you make sure to not mix up parameters and such
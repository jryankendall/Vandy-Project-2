//Link in html AFTER newsfeed.js and jquery

function ajaxGet(url) {
    return $.ajax({
        type: "GET",
        url: url
    });
}

function fetchNews(appid, callback) {
    //Whoever is writing the htmlRoutes: Note the url. The html route should get from "/api/news/:appid"
    ajaxUrl = "/api/news/" + appid;
    ajaxGet(ajaxUrl).then(function(response) {
        callback(response);
    });
}

//This function should be called and passed a jQuery pointer, pointing to an input box. ie, this function should be called like: getAppInputFromBox($("#user-app-input"));
function getAppInputFromBox(inputBox) {
    var userInputApp = inputBox.val(); 
    return getAppNewsFromId(userInputApp);
}

//You can pass the game's appid directly to this function if you want to skip user input
function getAppNewsFromId(inputId) {
    return fetchNews(inputId, printOutNews);
}

function printOutNews(data) {
    var appNews = new NewsObject(data);
    appNews.printNews();
}

//The below is just so ESLint doesn't cry that I'm not using getAppInputFromBox, can edit it later. For next project, should remove the "no-unused-vars": "error" line from .eslintrc.json to stop this error
$("button").on("click", "#appid-input-submit", function(event) {
    event.preventDefault();
    getAppInputFromBox($("#user-app-input-box"));
});
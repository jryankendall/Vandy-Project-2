$(document).ready(function () {
    var APIkey = "B82D9F592F8EBCC4BD6130029F700D2B";

    // calls steam API to get friends list for specified user
    var getFriendsList = function (steamid) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=" + APIkey + "&steamid=" + steamid,
            "method": "GET",
            "headers": {
                "Cache-Control": "no-cache",
                "Host": "api.steampowered.com",
                "Connection": "keep-alive",
                "cache-control": "no-cache"
            }
        };
        // make ajax call to api (refactor for backend)
        $.ajax(settings).done(function (response) {
            var data = JSON.parse(response);
            var friendslist = data.friendslist.friends;
            friendslist.forEach(function (element) {
                getPlayerSummary(element.steamid);
            });
        });
    };

    // displays info from Steam API about specified user
    var getPlayerSummary = function (steamid) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" + APIkey + "&steamid=" + steamid,
            "method": "GET",
            "headers": {
                "Host": "api.steampowered.com",
                "Connection": "keep-alive",
                "cache-control": "no-cache"
            }
        };
        // make ajax call to api (refactor for backend)
        $.ajax(settings).done(function (response) {
            var data = JSON.parse(response);
            var friendObj = data.response;
            var friendArr = data.response.players;
            friendArr.forEach(function (element) {
                console.log(element.personaname);
                console.log(element.steamid);
                console.log(element.profileurl);
                console.log(element.avatar);
            });
            return friendObj;
        });
    };


    // listen for click and call getFriendsList function
    $(document).on("click", ".friends", function () {
        getFriendsList($(this).attr("data-steamid"));
    });
});
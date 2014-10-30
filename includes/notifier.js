pollNotifications = function () {
    if (!safari.extension.settings.getItem('enableNotifications')) {
        console.log('notifications not enabled');
        setTimeout(pollNotifications, 60000);
        return;
    }

    console.log('notifications enabled');
    try {
        var notificationuid = safari.extension.settings.getItem("notificationuid");
        //console.log("Notification UID is " + notificationuid);
        if (notificationuid === undefined || notificationuid === null || notificationuid === '') {
            $.get("https://winchatty.com/v2/notifications/generateId", "json")
                .done(
                function (data) {
                    var notificationUID = data.id;
                    console.log("Got notification id of " + notificationUID);
                    safari.extension.settings.setItem("notificationuid", notificationUID);
                    setTimeout(pollNotifications, 1000);
                })
                .fail(function () {
                    console.log('failed.');
                    setTimeout(pollNotifications, 60000); //No bueno but we should try again eventually.
                });
            //Didn't have a UID so we can't do anything until we get one.
            return;
        }
        if (notificationuid != "" && notificationuid != undefined) {
            //http://notifications.winchatty.com/v2/notifications/waitForNotification
            postFormUrl("http://notifications.winchatty.com/v2/notifications/waitForNotification", "clientId=" + notificationuid,
                function (res) {
                    try {
                        if (res && res.responseText.length > 0 && res.status === 200) {
                            var notifications = JSON.parse(res.responseText);
                            if (!notifications.error) {
                                //console.log("notification response text: " + res.responseText);
                                if (notifications.messages) {
                                    for (var i = 0; i < notifications.messages.length; i++) {
                                        var n = notifications.messages[i];
                                        var notification = new Notification(n.body, {
                                            title: n.subject,
                                            icon: "images/icon.png"
                                        });
                                        notification.onclick = function() {
                                            var newTab = safari.application.activeBrowserWindow.openTab();
                                            newTab.url = "http://www.shacknews.com/chatty?id=" + n.postId.toString() + "#item_" + n.postId.toString();
                                        };
                                    }
                                }
                                //If everything was successful, poll again in 15 seconds.
                                setTimeout(pollNotifications, 15000);
                                return;
                            } else {
                                if (notifications.code === 'ERR_UNKNOWN_CLIENT_ID') {
                                    postFormUrl("https://winchatty.com/v2/notifications/registerNotifierClient",
                                        encodeURI("id=" + notificationuid + "&name=Shackfari (" + (new Date()) + ")"),
                                        function (res) {
                                            //console.log("Response from register client " + res.responseText);
                                            var result = JSON.parse(res.responseText);
                                            if (result.result === "success") {
                                                new Notification("You're not logged in to winchatty with this notifier.", {
                                                    title: "ChromeShack Error",
                                                    icon: "images/icon.png"
                                                });
                                                //safari.extension.settings.setItem('notificationuid', '');
                                                //safari.extension.settings.setItem('enableNotifications', false);
                                                var newTab = safari.application.activeBrowserWindow.openTab();
                                                newTab.addEventListener('close', function () {
                                                    setTimeout(pollNotifications, 1000);
                                                }, false);
                                                newTab.url = "https://winchatty.com/v2/notifications/ui/login?clientId=" + notificationuid;
                                            } else {
                                                //Something got messed up. Try again later.
                                                setTimeout(pollNotifications, 60000);
                                            }
                                        }
                                    );
                                    return;
                                } else if (notifications.code == 'ERR_CLIENT_NOT_ASSOCIATED') {
                                    new Notification("Launch new browser tab to log in to notifications.", {
                                        title: "ChromeShack Error"
                                    });
                                    //chrome.tabs.query({url: 'https://winchatty.com/v2/notifications/ui/login*'},
                                    //    function(tabs){
                                    //        // If they're not already logging in somewhere, they need to.  Otherwise we'll just leave it alone instead of bringing it to the front or anything annoying like that.
                                    //        if(tabs.length === 0) {
                                    //            chrome.tabs.create({url: "https://winchatty.com/v2/notifications/ui/login?clientId=" + notificationuid});
                                    //        }
                                    //    });
                                }
                            }
                        }
                    } catch (e) {
                    }

                    //If something went wrong, wait a minute before trying again.
                    setTimeout(pollNotifications, 60000);
                }
            );
        }
        else {
            //console.log("Notifications not set up.");
        }
    }
    catch (e) {
        setTimeout(pollNotifications, 60000);
    }
};

postFormUrl = function (url, data, callback) {
    // It's necessary to set the request headers for PHP's $_POST stuff to work properly
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr != undefined && xhr != null) {
                callback(xhr);
            }
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(data);
};

$(function () {
    pollNotifications();
});
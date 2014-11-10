Notifier = {
    errorTimeout: 60000,
    successTimeout: 1000,
    immediateTimeout: 500
};

//TODO: I can't figure out how to get icons to work for notifications so.... whatever.

pollNotifications = function () {
    if (!safari.extension.settings.getItem('enableNotifications')) {
        console.log('notifications not enabled');
        setTimeout(pollNotifications, Notifier.errorTimeout);
        return;
    }

    console.log('notifications enabled');
    try {
        var notificationuid = safari.extension.settings.getItem("notificationuid");
        //console.log("Notification UID is " + notificationuid);
        if (notificationuid === undefined || notificationuid === null || notificationuid === '') {
            //This will set re-call pollNotifcations as appropriate.
            getNotificationUID();
        } else { //We have a notification ID, so it's time to try to get some notifications.
            postFormUrl("http://notifications.winchatty.com/v2/notifications/waitForNotification",
                "clientId=" + notificationuid,
                gotNotificationResponse
            );
        }
    }
    catch (e) {
        setTimeout(pollNotifications, Notifier.errorTimeout);
    }
};

getNotificationUID = function() {
    $.get("https://winchatty.com/v2/notifications/generateId", "json")
        .done(
        function (data) {
            var notificationUID = data.id;
            console.log("Got notification id of " + notificationUID);
            safari.extension.settings.setItem("notificationuid", notificationUID);
            setTimeout(pollNotifications, Notifier.successTimeout); //We've got a uid now so let's re-run the function quickly since we'll need to log in to register the browser.
        })
        .fail(function () {
            console.log('failed.');
            setTimeout(pollNotifications, Notifier.errorTimeout); //No bueno but we should try again eventually.
        });
};

gotNotificationResponse = function (res) {
    try {
        if (res && res.responseText.length > 0 && res.status === 200) {
            var notifications = JSON.parse(res.responseText);
            if (!notifications.error) {
                //console.log("notification response text: " + res.responseText);
                if (notifications.messages) {
                    for (var i = 0; i < notifications.messages.length; i++) {
                        var n = notifications.messages[i];
                        var notification = new Notification(n.body, {
                            title: n.subject
                        });
                        notification.onclick = function() {
                            var newTab = safari.application.activeBrowserWindow.openTab();
                            newTab.url = "http://www.shacknews.com/chatty?id=" + n.postId.toString() + "#item_" + n.postId.toString();
                            this.close(); //Remove notification when it's clicked.
                        };
                    }
                }
                setTimeout(pollNotifications, Notifier.successTimeout);
                return;
            } else {
                if (notifications.code === 'ERR_UNKNOWN_CLIENT_ID') {
                    var n = new Notification("You're not logged in to winchatty with this notifier.", {
                        title: "ChromeShack Error"
                    });

                    n.onclick = function () {
                        //Close the notification when clicked, then start the process of logging back in.
                        this.close();
                        var notificationuid = safari.extension.settings.getItem("notificationuid");
                        postFormUrl("https://winchatty.com/v2/notifications/registerNotifierClient",
                            encodeURI("id=" + notificationuid + "&name=Shackfari (" + (new Date()) + ")"),
                            function (res) {
                                //console.log("Response from register client " + res.responseText);
                                var result = JSON.parse(res.responseText);
                                if (result.result === "success") {
                                    var newTab = safari.application.activeBrowserWindow.openTab();
                                    newTab.addEventListener('close', function () {
                                        setTimeout(pollNotifications, Notifier.successTimeout);
                                    }, false);
                                    newTab.url = "https://winchatty.com/v2/notifications/ui/login?clientId=" + notificationuid;
                                } else {
                                    //Something got messed up. Try again later.
                                    setTimeout(pollNotifications, Notifier.errorTimeout);
                                }
                            }
                        );
                    };
                    return;
                } else if (notifications.code == 'ERR_CLIENT_NOT_ASSOCIATED') {
                    //new Notification("This client is no longer associated to receive notifications for this account.  Please log in again.", {
                    //    title: "ChromeShack Error"
                    //});
                    //We'll just get rid of the ID rather than re-associate with it since the code is already written to do that.
                    safari.extension.settings.setItem("notificationuid", "");
                    setTimeout(pollNotifications, Notifier.immediateTimeout);
                    return;
                }
            }
        }
    } catch (e) {
        //Catch any exceptions and we'll fall through to
        console.log('Problem getting notifications ' + e.message);
    }

    //If something went wrong, wait a minute before trying again.
    setTimeout(pollNotifications, Notifier.errorTimeout);
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
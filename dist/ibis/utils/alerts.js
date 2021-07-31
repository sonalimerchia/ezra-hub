"use strict";
var NotificationCenter = require("node-notifier").NotificationCenter;
var sample_payload = {
    title: undefined,
    subtitle: undefined,
    message: undefined,
    sound: false,
    icon: "Terminal Icon",
    contentImage: undefined,
    open: undefined,
    wait: false,
    // New in latest version. See `example/macInput.js` for usage
    timeout: 5,
    closeLabel: undefined,
    actions: undefined,
    dropdownLabel: undefined,
    reply: false,
};

function display_app_notification(msg, additional_options) {
    if (!additional_options) { additional_options = {}; }
    return new Promise(function (resolve, reject) {
        var options = {
            title: "Ezra",
            message: msg,
            sound: "Glass",
            wait: false,
            timeout: 8,
        };
        for (var option in additional_options) {
            options[option] = additional_options[option];
        }
        new NotificationCenter().notify(options, function (err, response, metadata) {
            if (err) {
                console.log("an error has occured")
                reject(err);
            }
            else {
                resolve({
                    response: response,
                    data: metadata,
                });
            }
        });
    });
}

global.alerts = {
    alert: function (msg) {
        return display_app_notification(msg);
    }
}
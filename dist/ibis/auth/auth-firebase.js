"use strict";
const open = require('open')
const axios = require('axios')
const uuid = require('uuid')
var path = require('path');

const myURL = new URL(path.join(Constants.SPHINX_URL, "auth"));
myURL.searchParams.append("state", Constants.IBIS_CLIENT_ID)
LOG.info("Initializing with Client ID: " + Constants.IBIS_CLIENT_ID)
const OTC_FIREBASE_PATH = `https://ezra-messaging.firebaseio.com/sphinx/otc/auth/${Constants.IBIS_CLIENT_ID}.json`

exports.onReady = () => {
    return new Promise((resolve, reject) => {
        open(myURL.toString())

        var attempts = 0

        var auth_poller = setInterval(() => {
            axios.get(OTC_FIREBASE_PATH).then((response) => {
                attempts += 1
                if (response.data) {
                    clearInterval(auth_poller)
                    LOG.success("Received Auth Token" + response.data)
                } else if (attempts > Constants.IBIS_POLLING_LIMIT) {
                    clearInterval(auth_poller)
                    alerts.alert("Login timeout. Please reboot the app and try again.")
                    reject(new exceptions.EzraFatalError("Firebase Login timed out"))
                }
            })
        }, 1000)
    });
    
    
}

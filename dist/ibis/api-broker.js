"use strict";
const uuid = require('uuid')
const ngrok = require('ngrok');
const express = require("express");
const firebaseTools = require('firebase');
const axios = require('axios')
const PORT = process.env.PORT || 6060
const open = require('open')

const OAUTH_URL = "https://accounts.google.com/o/oauth2/auth"
const TOKEN_URL = "https://accounts.google.com/o/oauth2/token"
const CLIENT_ID = "102989164212-8pl4tdj1i5pn381qvmqlu3bii94d8nj0.apps.googleusercontent.com"
const CLIENT_SECRET = "EiyqsNLm3nEJbZOgIMWt2IbZ"
const SCOPE = "https://www.googleapis.com/auth/contacts.readonly"

const OAUTH_CONFIG = {
    "response_type": "code",
    "client_id": CLIENT_ID,
    "redirect_uri": `http://localhost:${5000}/oauth/google`,
    "scope": SCOPE,
    "state": uuid.v4(),
    "access_type": "offline"
}

var brokerClient = express();

brokerClient.get("/", (req, res) => {
    LOG.info(req.query)
    res.json({ "status": "active" });
})


// Did Receive New Scheduled Campaign

brokerClient.get("/oauth/google", (req, res) => {
    LOG.success("OAUTH CODE" + req.query.code)
    LOG.success("OAUTH SCOPE" + req.query.scope)

    axios.post(TOKEN_URL, {
        code: req.query.code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `http://localhost:${PORT}/oauth/google`,
        grant_type: "authorization_code"
    })
    .then(function (response) {
        LOG.info(response.data);
    })
    .catch(function (error) {
        LOG.error(error);
    });

    res.status(200).send()
})


brokerClient.listen(PORT, () => {
    LOG.info("Server running on port " + PORT);
});

// Login Notification

// ngrok.connect().then((info) => {
//     LOG.success(`Broadcasting on ${info}`)
    
// })



const myURL = new URL(OAUTH_URL);
for (var key in OAUTH_CONFIG) {
    myURL.searchParams.append(key, OAUTH_CONFIG[key])
}

open(myURL.toString())

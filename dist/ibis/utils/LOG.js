"use strict";
var log4js = require("log4js");
var path = require('path');
var fs = require('fs');

const LOG_FILE = path.join(app.getPath("logs"), app.getName(), "logs.log");

if (!fs.existsSync(LOG_FILE)) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.openSync(LOG_FILE, "w+")
}

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] [%f{1}:%l] - %m%]",
            },
        },
        file: {
            type: "file",
            filename: LOG_FILE
        }
        
    },
    categories: {
        default: { appenders: ["out", 'file'], level: "info", enableCallStack: true },
    },
    levels: {
        trace: { value: 1000, colour: "cyan" },
        debug: { value: 2000, colour: "grey" },
        info: { value: 3000, colour: "white" },
        success: { value: 3500, colour: "green" },
        warn: { value: 4000, colour: "yellow" },
        error: { value: 5000, colour: "red" },
        fatal: { value: 6000, colour: "magenta" },
    },
});
var logger = log4js.getLogger();
logger.level = "debug";
global.LOG = logger;
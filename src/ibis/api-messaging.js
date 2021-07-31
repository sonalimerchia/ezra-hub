"use strict";
var os = require("os");
var path = require("path");
var fs = require("fs");
var alerts = require("./utils/alerts");
var SQLiteClient = require("./utils/sql-client");
// var AppSupport = require('./utils/appsupport');

const runApplescript = require("run-applescript");

var AsyncLock = require("async-lock");
const lock = new AsyncLock();

// Figure out where the chat db is
var chat_db_path = path.join(os.homedir(), "Library/Messages");
if (!fs.existsSync(chat_db_path)) {
  // String
  console.error("Could not locate chat.db file.");
  alerts.message("Could not locate chat.db file. Please contact support.");
  process.exit(1);
} else {
  console.info("Located sqlite3 chat db");
}
var dbClient = new SQLiteClient(chat_db_path, true);

function sendWithUI(phoneNumber, message) {
  var script = `
        activate application "Messages"
        tell application "System Events" to tell process "Messages"
            key code 45 using command down
            delay 0.15
            keystroke \"${phoneNumber}\"
            key code 36
            delay 0.15
            keystroke \"${message}\"
            key code 36
            delay 0.15
        end tell
    `;
  return lock
    .acquire("UI", function () {
      // return value or promise
      return runApplescript(script);
    })
    .then(function (scriptOutput) {
      // lock released
      console.debug(
        `Messaged ${phoneNumber} using the UI (Output: ${scriptOutput})`
      );
      return scriptOutput;
    });
}

function sendWithAppleScript(phoneNumber, message) {
  // attempt to send as iMessage
  var iMessageScript = `
        tell application "Messages"
            set iMessageService to 1st service whose service type = iMessage
            set recipient to buddy \"${phoneNumber}\" of iMessageService        
            send \"${message}\" to recipient
        end tell
    `;
  var textScript = `
        tell application "Messages"
            send \"${message}\" to buddy \"${phoneNumber}\" of service "SMS"
        end tell
    `;
  return runApplescript(iMessageScript).catch((err) => {
    console.error(
      `[${phoneNumber}] Process finished with exit code ${err.exitCode}: ${err.stderr}`
    );
    return runApplescript(textScript);
  });
}

exports.sendMessage = function (phoneNumber, message) {
  phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

  return dbClient.hasActiveChat(phoneNumber).then(function (active) {
    if (!active) {
      // send the message with the UI hack
      // console.info(`Messaging ${phoneNumber} with UI Macros`);
      return sendWithUI(phoneNumber, message);
    } else {
      // send the message with the script
      // console.info(`Messaging ${phoneNumber} with normal Chat API`);
      return sendWithAppleScript(phoneNumber, message);
    }
  });
};

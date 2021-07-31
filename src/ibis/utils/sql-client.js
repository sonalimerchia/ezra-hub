"use strict";
const stringSimilarity = require("string-similarity");
var ns_sqlite3 = require("sqlite3");
var pathMod = require("path");
var sqlite3 = ns_sqlite3.verbose();

const MAX_CHATID_PADDING = 4;
const SERVICE_IMESSAGE = "iMessage";
const SERVICE_SMS = "SMS";

class SQLiteClient {
  /**
   * Initializes an SQLite3 DB
   * @param {str} path path to the .db file
   * @param {bool} read_only open the DB in read_only. Defaults to false.
   */
  constructor(path, read_only = false) {
    var crud = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
    var ro = sqlite3.OPEN_READONLY;
    var open_format = read_only ? ro : crud;
    const dbPath = pathMod.resolve(path, "chat.db");
    this.db = new sqlite3.Database(dbPath, function (err) {
      if (err) {
        console.log(err);
        console.error(`[${dbPath}]: ${err.message}`);
      } else {
        console.log(`Connected to ${dbPath}.`);
      }
    });
  }
  /**
   * Executes a SQL Query.
   * @param {str} query_string SQL Command to Execute
   */
  query(query_string) {
    var _this = this;

    var tmp_err = new Error();
    Error.captureStackTrace(tmp_err, _this.query);

    var promise = new Promise(function (resolve, reject) {
      _this.db.serialize(function () {
        _this.db.all(query_string, (err, rows) => {
          if (err) {
            console.log("in err", err);
            return reject(err);
          }
          //   console.trace(
          //     `Queried ${rows.length} records when searching for ${query_string}`
          //   );
          resolve(rows);
        });
      });
    });

    return promise.catch((err) => {
      var new_exc = exceptions.mergeExceptions(tmp_err, err);
      throw new_exc.stack;
    });
  }

  hasActiveChat(phoneNumber) {
    return this.query(
      `
            SELECT chat_identifier, successful_query, service_name
            FROM chat
            WHERE chat_identifier LIKE "%${phoneNumber}%"
        `
    ).then(function (records) {
      // console.trace(records);
      if (records.length == 0) {
        console.debug(`No records found for ${phoneNumber}`);
        return false;
      }

      var chatIDs = records.map((x) => x.chat_identifier);
      var matchData = stringSimilarity.findBestMatch(phoneNumber, chatIDs);
      var bestRecord = records[matchData.bestMatchIndex];

      // validate that the record is a strong enough match
      var difference = Math.abs(
        bestRecord.chat_identifier.length - phoneNumber.length
      );
      console.debug(
        `Difference: ${difference} (${bestRecord.chat_identifier}, ${phoneNumber})`
      );
      if (difference < MAX_CHATID_PADDING) {
        // console.trace(bestRecord);
        if (bestRecord.service_name == SERVICE_SMS) {
          return true;
        } else if (bestRecord.service_name == SERVICE_IMESSAGE) {
          return bestRecord.successful_query == 1;
        }

        return true;
      }
      return false;
    });
  }
}

module.exports = SQLiteClient;

// class DummySQLClient {
//     constructor() { }
//     query() {
//         return new Promise((resolve, reject) => {
//             runQuery((data, err) => err ? reject(err) : resolve(data))
//         });
//     }
// }

// function runQuery(cb) {
//     cb("data", "error");
// }

// module.exports = DummySQLClient

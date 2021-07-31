// Creates a Local Database in Application Support to Store Persistent Memory State and Other Data
var path = require('path');
var fs = require('fs');
var os = require('os');
var SQLiteClient = require('./sql-client');

const LOCAL_DB_PATH = path.join(app.getPath("userData"), "app.db");
const EXPECTED_CHAT_DB_PATH = path.join(os.homedir(), "Library/Messages", "chat.db");
const DEFAULT_DB = {
    "imessage_chat_db": EXPECTED_CHAT_DB_PATH,
    "poller_frequency": 60 // polling frequency in minutes
}
const DEFAULT_DB_NAME = "AppConfig"

if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.openSync(LOCAL_DB_PATH, "w+")
}

LOG.info("LocalDB: " + LOCAL_DB_PATH);
const LOCAL_DB = new SQLiteClient(LOCAL_DB_PATH, false);

const LOCAL_DB_SCHEMA = `CREATE TABLE IF NOT EXISTS ${DEFAULT_DB_NAME} (
	property text PRIMARY KEY,
	val text NOT NULL
);`

/* 
App Configuration
- iMessage Chat DB File Path
- Campaign Manager Poller Frequency
- User Account Refresh Tokens (Provided From Front End)

*/

/**
 * Fetch value for system property.
 * @param {str} key 
 */
async function fetch_value(key) {
    const read_command = `SELECT val from ${DEFAULT_DB_NAME} WHERE property="${key}";`
    var records = await LOCAL_DB.query(read_command);
    if (records.length == 0) { return null; }
    return records[0]['val']
}

/**
 * Adds a value to the DB if it exists
 * @param {str} key 
 * @param {str} value 
 */
async function insert_if_empty(key, value) {
    var current_value = await fetch_value(key);
    if (!current_value) {
        const insertion_command = `INSERT INTO ${DEFAULT_DB_NAME} VALUES ("${key}", "${value}");`
        LOG.debug(insertion_command)
        await LOCAL_DB.query(insertion_command);
    }
    return await fetch_value(key);
}

/** */
exports.whenReady = async () => {
    try {
        await LOCAL_DB.query(LOCAL_DB_SCHEMA);
    } catch (err) {
        LOG.info("PAY ATTENTION")
        throw new exceptions.EzraFatalError(err);
    }

    for (var property in DEFAULT_DB) {
        const final_value = await insert_if_empty(property, DEFAULT_DB[property]);
        LOG.info(`${property} = ${final_value}`)
    }
}

exports.fetch_property = fetch_value;
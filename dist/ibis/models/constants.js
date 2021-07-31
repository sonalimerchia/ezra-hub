const uuid = require('uuid')

global.Constants = {
    SPHINX_URL: "http://localhost:5000",
    IBIS_CLIENT_ID: uuid.v4(),
    IBIS_POLLING_LIMIT: 60
}
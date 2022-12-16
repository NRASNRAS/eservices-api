const Pool = require('pg').Pool

const pool = new Pool({
    user: "dqu1j",
    host: "localhost",
    database: "nras",
    password: "penis",
    port: 5432,
});

module.exports = pool
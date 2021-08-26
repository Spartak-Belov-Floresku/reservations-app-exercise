/** Database for lunchly */

const {Client} = require("pg");

let DB_URL = {
    host: "localhost",
    user: "biztime_user",
    port: 5432,
    password: "password",
    database: ""
}

DB_URL.database = (process.env.NODE_ENV === "test")? "lunchly_test": "lunchly";


let db = new Client(DB_URL);

db.connect();

module.exports = db;

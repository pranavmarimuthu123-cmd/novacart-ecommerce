const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

db.getConnection()
    .then((connection) => {
        console.log("MySQL database connected successfully!");
        connection.release();
    })
    .catch((error) => {
        console.error("MySQL connection failed:", error.message);
    });

module.exports = db;
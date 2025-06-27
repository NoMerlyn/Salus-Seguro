const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'sql7.freesqldatabase.com',
    user: 'sql7787030',
    password: 'q16bBaucjx',
    database: 'sql7787030',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;

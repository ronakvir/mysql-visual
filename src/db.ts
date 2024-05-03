
export function test() {
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: '',
    password: ''
    });
    console.log(connection);
    connection.query(
    'SELECT * FROM `actor` where `actor_id` < 5',
    function (err, results, fields) {
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
        console.log(err);
    }
    );
};
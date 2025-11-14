const mysql = require('mysql2');

// If DISABLE_DB is set, export a dummy connection object so the server can run
// without a live MySQL server. This is handy for local frontend testing.
if (process.env.DISABLE_DB === 'true') {
    console.warn('DISABLE_DB is true — exporting dummy DB connection (no real DB operations).');
    const dummy = {
        query: function (sql, params, cb) {
            // Support both (sql, cb) and (sql, params, cb)
            if (typeof params === 'function') {
                cb = params;
            }
            const err = new Error('Database disabled (DISABLE_DB=true)');
            if (typeof cb === 'function') return cb(err);
            // If no callback provided, return a rejected promise
            return Promise.reject(err);
        }
    };
    module.exports = dummy;
} else {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'your_password', // Change this to your MySQL password
        database: 'localfinder_db'
    });

    // Do not call connection.connect() here to avoid forcing a DB connection on startup.
    // The app will attempt queries later; if MySQL isn't running those queries should be
    // handled gracefully by the route handlers.
    console.log('Database configuration loaded (connection will be established on first query).');

    module.exports = connection;
}
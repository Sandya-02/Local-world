const { Pool } = require('pg');

// If DISABLE_DB is set, export a dummy connection object so the server can run
// without a live database. This is handy for local frontend testing.
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
    // PostgreSQL connection pool for Supabase
    const pool = new Pool({
        host: process.env.DB_HOST || 'db.gfaqgcrjgtkofltyfcbr.supabase.co',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Poojitha@23341A1230',
        database: process.env.DB_NAME || 'postgres',
        ssl: {
            rejectUnauthorized: false
        },
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    // Test connection on startup
    pool.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error('❌ Database connection error:', err.message);
        } else {
            console.log('✅ PostgreSQL database connected successfully!');
            console.log('📅 Server time:', result.rows[0].now);
        }
    });

    module.exports = pool;
}
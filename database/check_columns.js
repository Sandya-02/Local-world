const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {rejectUnauthorized: false}
});

async function checkColumns() {
    console.log('REVIEWS table columns:');
    const reviews = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='reviews' ORDER BY ordinal_position");
    reviews.rows.forEach(c => console.log(' -', c.column_name));
    
    console.log('\nFAVORITES table columns:');
    const favorites = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='favorites' ORDER BY ordinal_position");
    favorites.rows.forEach(c => console.log(' -', c.column_name));
    
    await pool.end();
}

checkColumns();

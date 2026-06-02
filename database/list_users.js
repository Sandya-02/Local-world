const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        await client.connect();
        console.log('\n📋 All Users in Database:\n');
        
        const result = await client.query('SELECT id, username, email, user_type, created_at FROM users ORDER BY id');
        
        result.rows.forEach(user => {
            console.log(`ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Type: ${user.user_type}`);
        });
        
        console.log(`\n✅ Total users: ${result.rows.length}\n`);
        
        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();

const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function cleanSampleData() {
    try {
        await client.connect();
        console.log('🔌 Connected to database\n');
        
        // Delete sample data in correct order (due to foreign keys)
        console.log('🗑️  Deleting sample data...\n');
        
        // Delete favorites
        await client.query('DELETE FROM favorites');
        console.log('✅ Deleted sample favorites');
        
        // Delete reviews
        await client.query('DELETE FROM reviews');
        console.log('✅ Deleted sample reviews');
        
        // Delete bookings
        await client.query('DELETE FROM bookings');
        console.log('✅ Deleted sample bookings');
        
        // Delete messages
        await client.query('DELETE FROM messages');
        console.log('✅ Deleted sample messages');
        
        // Delete notifications
        await client.query('DELETE FROM notifications');
        console.log('✅ Deleted sample notifications');
        
        // Delete services
        await client.query('DELETE FROM services');
        console.log('✅ Deleted sample services');
        
        // Delete sellers
        await client.query('DELETE FROM sellers');
        console.log('✅ Deleted sample sellers');
        
        // Delete sample users (keep only actual registered users)
        // Sample users are IDs 1-8 (john_doe, jane_smith, mike_seller, sarah_seller, bob_seller, newuser123, finaltest, testuser)
        // Keep only user ID 9 (poojithadoppa8@gmail.com)
        const result = await client.query('DELETE FROM users WHERE id != 9 RETURNING username, email');
        console.log(`✅ Deleted ${result.rowCount} sample users`);
        
        console.log('\n📋 Remaining Users:');
        const remaining = await client.query('SELECT id, username, email, user_type FROM users ORDER BY id');
        remaining.rows.forEach(user => {
            console.log(`   ID: ${user.id} | ${user.username} | ${user.email}`);
        });
        
        console.log('\n✨ Database cleaned! Only your actual data remains.\n');
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

cleanSampleData();

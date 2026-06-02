const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function updatePasswords() {
    try {
        await client.connect();
        console.log('🔌 Connected to database\n');
        
        // Hash the password 'password123'
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('🔐 Updating passwords for sample users...\n');
        
        // Update passwords for sample users (IDs 1-5)
        const sampleUserIds = [1, 2, 3, 4, 5];
        
        for (const userId of sampleUserIds) {
            await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
            const result = await client.query('SELECT username, email FROM users WHERE id = $1', [userId]);
            if (result.rows.length > 0) {
                console.log(`✅ Updated: ${result.rows[0].username} (${result.rows[0].email})`);
            }
        }
        
        console.log('\n✨ All sample user passwords updated to: password123');
        console.log('\n📋 You can now login with:');
        console.log('   Email: john@example.com | Password: password123');
        console.log('   Email: jane@example.com | Password: password123');
        console.log('   Email: mike@business.com | Password: password123');
        console.log('   Email: sarah@cleanpro.com | Password: password123');
        console.log('   Email: bob@techrepair.com | Password: password123');
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updatePasswords();

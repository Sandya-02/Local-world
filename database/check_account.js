const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkUser() {
    try {
        await client.connect();
        console.log('🔍 Checking for your account...\n');
        
        const email = 'poojithadoppa8@gmail.com';
        
        const result = await client.query(
            'SELECT id, username, email, user_type, created_at FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ Account found in database!\n');
            console.log('📋 Account Details:');
            console.log(`   User ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Type: ${user.user_type}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('\n💡 Note: Password is encrypted in database (cannot be displayed)');
            console.log('\n❓ What password did you use when you registered?');
            console.log('   Common options:');
            console.log('   - Poojitha@2334');
            console.log('   - Poojitha@23341A1230');
            console.log('   - Something else?');
        } else {
            console.log('❌ No account found with this email');
        }
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUser();

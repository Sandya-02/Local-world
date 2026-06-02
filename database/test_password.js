const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function testOrResetPassword() {
    try {
        await client.connect();
        
        const email = 'poojithadoppa8@gmail.com';
        
        // Get user from database
        const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            console.log('❌ User not found');
            await client.end();
            return;
        }
        
        const user = userResult.rows[0];
        console.log('\n✅ Account found in database!');
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}\n`);
        
        // Test possible passwords
        const possiblePasswords = [
            'Poojitha@2334',
            'Poojitha@23341A1230',
            'poojitha@2334',
            'Poojitha2334',
            'Poojitha@123',
            'poojitha123'
        ];
        
        console.log('🔍 Testing possible passwords...\n');
        
        let foundPassword = null;
        for (const password of possiblePasswords) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                foundPassword = password;
                console.log(`✅ PASSWORD FOUND: ${password}\n`);
                break;
            }
        }
        
        if (foundPassword) {
            console.log('🎉 SUCCESS! Your login credentials are:');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${foundPassword}`);
            console.log('\n✨ You can now login at: http://localhost:8080/login.html\n');
        } else {
            console.log('❌ None of the common passwords matched.\n');
            console.log('Would you like to reset your password?');
            console.log('Run this command to set a new password:\n');
            console.log('   node reset_my_password.js YOUR_NEW_PASSWORD\n');
        }
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testOrResetPassword();

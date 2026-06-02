const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function resetPassword() {
    try {
        const newPassword = process.argv[2];
        
        if (!newPassword) {
            console.log('❌ Please provide a new password');
            console.log('Usage: node reset_my_password.js YOUR_NEW_PASSWORD');
            console.log('\nExample: node reset_my_password.js Poojitha@2334');
            process.exit(1);
        }
        
        await client.connect();
        
        const email = 'poojithadoppa8@gmail.com';
        
        console.log('\n🔐 Resetting password...\n');
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password in database
        await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        
        console.log('✅ Password reset successfully!\n');
        console.log('🔐 Your new login credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${newPassword}`);
        console.log('\n✨ You can now login at: http://localhost:8080/login.html\n');
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetPassword();

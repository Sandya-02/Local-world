const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function registerUser() {
    try {
        await client.connect();
        console.log('🔌 Connected to database\n');
        
        const email = 'poojithadoppa8@gmail.com';
        const password = 'Poojitha@2334'; // Using a password based on your Supabase credentials
        const username = 'poojitha';
        const fullName = 'Poojitha';
        
        // Check if user already exists
        const checkResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (checkResult.rows.length > 0) {
            console.log('⚠️  User already exists! Updating password...\n');
            const hashedPassword = await bcrypt.hash(password, 10);
            await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
            console.log('✅ Password updated successfully!\n');
        } else {
            console.log('📝 Creating new user account...\n');
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await client.query(
                'INSERT INTO users (username, email, password, full_name, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [username, email, hashedPassword, fullName, 'user']
            );
            
            console.log('✅ User created successfully!\n');
            console.log(`   User ID: ${result.rows[0].id}`);
        }
        
        console.log('🔐 Your Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n✨ You can now login at http://localhost:8080/login.html\n');
        
        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

registerUser();

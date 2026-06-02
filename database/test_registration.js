// Test Registration API
const fetch = require('node-fetch');

async function testRegistration() {
    console.log('🧪 Testing User Registration API\n');
    
    // Test data
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        full_name: 'Test User',
        phone: '555-1234',
        address: '123 Test Street',
        user_type: 'user'
    };
    
    console.log('📝 Registering test user:');
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}\n`);
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Registration Successful!');
            console.log('\n📊 Response:');
            console.log(JSON.stringify(result, null, 2));
            
            // Verify in database
            const { Pool } = require('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
                ssl: { rejectUnauthorized: false }
            });
            
            const dbResult = await pool.query('SELECT id, username, email, full_name, user_type, created_at FROM users WHERE email = $1', [testUser.email]);
            
            if (dbResult.rows.length > 0) {
                console.log('\n✅ User found in Supabase database:');
                console.log(JSON.stringify(dbResult.rows[0], null, 2));
            } else {
                console.log('\n❌ User NOT found in database!');
            }
            
            await pool.end();
            
        } else {
            console.log('❌ Registration Failed!');
            console.log('\n📊 Error Response:');
            console.log(JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testRegistration();

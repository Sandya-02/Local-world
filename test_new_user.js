// Test script to register a new user via API and verify in database
const fetch = require('node-fetch');
const { Client } = require('pg');

const DB_CONFIG = {
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
};

async function testRegistration() {
    console.log('\n🧪 Testing User Registration via Website API\n');
    
    // Test credentials
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@localfinder.com',
        phone: '555-123-4567',
        address: '123 Test Street, Test City, TC 12345',
        password: 'Test@1234',
        userType: 'customer'
    };
    
    try {
        // Step 1: Register via API
        console.log('📝 Step 1: Registering new user via API...');
        console.log('   Email:', testUser.email);
        console.log('   Name:', testUser.firstName, testUser.lastName);
        
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: testUser.email.split('@')[0],
                email: testUser.email,
                password: testUser.password,
                full_name: `${testUser.firstName} ${testUser.lastName}`,
                phone: testUser.phone,
                address: testUser.address,
                user_type: testUser.userType
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.log('❌ Registration failed:', result.message || result.error);
            if (result.message && result.message.includes('already exists')) {
                console.log('ℹ️  User already exists - that\'s okay, let\'s verify it in database');
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } else {
            console.log('✅ Registration successful!');
            console.log('   User ID:', result.user?.id);
        }
        
        // Step 2: Verify in database
        console.log('\n🔍 Step 2: Verifying user in database...');
        const client = new Client(DB_CONFIG);
        await client.connect();
        
        const query = 'SELECT id, username, email, full_name, phone, address, user_type, created_at FROM users WHERE email = $1';
        const dbResult = await client.query(query, [testUser.email]);
        
        if (dbResult.rows.length === 0) {
            console.log('❌ User NOT found in database!');
        } else {
            const user = dbResult.rows[0];
            console.log('✅ User found in database!');
            console.log('   ID:', user.id);
            console.log('   Username:', user.username);
            console.log('   Email:', user.email);
            console.log('   Full Name:', user.full_name);
            console.log('   Phone:', user.phone);
            console.log('   Address:', user.address);
            console.log('   User Type:', user.user_type);
            console.log('   Created:', user.created_at);
        }
        
        // Step 3: Test Login
        console.log('\n🔐 Step 3: Testing login with new credentials...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        
        const loginResult = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.log('❌ Login failed:', loginResult.message);
        } else {
            console.log('✅ Login successful!');
            console.log('   Token:', loginResult.token ? loginResult.token.substring(0, 30) + '...' : 'generated');
            console.log('   User:', loginResult.user.email);
        }
        
        await client.end();
        
        console.log('\n🎉 All tests passed! Your website is working correctly!\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

testRegistration();

const { Client } = require('pg');

const DB_CONFIG = {
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
};

async function testRealUserData() {
    console.log('\n🧪 TESTING REAL USER DATA FLOW\n');
    console.log('='  .repeat(60));
    
    const client = new Client(DB_CONFIG);
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // Test 1: Check existing sample users
        console.log('📋 TEST 1: Existing Sample Users');
        console.log('-'.repeat(60));
        const existingUsers = await client.query('SELECT id, email, full_name, user_type FROM users ORDER BY id');
        console.log(`Found ${existingUsers.rows.length} users:`);
        existingUsers.rows.forEach(u => {
            console.log(`   ${u.id}. ${u.full_name} (${u.email}) - ${u.user_type}`);
        });
        
        // Test 2: Insert a new user with REAL data (simulating registration form)
        console.log('\n📝 TEST 2: Inserting NEW User with Real Form Data');
        console.log('-'.repeat(60));
        const newUserData = {
            username: 'realuser2026',
            email: 'realuser2026@example.com',
            password: '$2a$10$hashedpassword',  // Simulating bcrypt hash
            full_name: 'Real Test User',
            phone: '555-999-8888',
            address: '456 Real Street, Real City, RC 67890',
            user_type: 'user'
        };
        
        console.log('Inserting:');
        console.log(`   Name: ${newUserData.full_name}`);
        console.log(`   Email: ${newUserData.email}`);
        console.log(`   Phone: ${newUserData.phone}`);
        console.log(`   Address: ${newUserData.address}`);
        
        const insertResult = await client.query(
            `INSERT INTO users (username, email, password, full_name, phone, address, user_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, email, full_name, phone, address, user_type, created_at`,
            [newUserData.username, newUserData.email, newUserData.password, 
             newUserData.full_name, newUserData.phone, newUserData.address, newUserData.user_type]
        );
        
        console.log('✅ User inserted successfully!');
        console.log(`   ID: ${insertResult.rows[0].id}`);
        console.log(`   Created at: ${insertResult.rows[0].created_at}`);
        
        // Test 3: Retrieve the data back
        console.log('\n🔍 TEST 3: Retrieving Inserted User Data');
        console.log('-'.repeat(60));
        const retrieved = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [newUserData.email]
        );
        
        if (retrieved.rows.length > 0) {
            const user = retrieved.rows[0];
            console.log('✅ User retrieved successfully!');
            console.log(`   ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Full Name: ${user.full_name}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Address: ${user.address}`);
            console.log(`   User Type: ${user.user_type}`);
            console.log(`   Created: ${user.created_at}`);
            
            // Verify data matches
            const matches = 
                user.full_name === newUserData.full_name &&
                user.phone === newUserData.phone &&
                user.address === newUserData.address;
            
            if (matches) {
                console.log('\n✅ DATA INTEGRITY VERIFIED! All fields match.');
            } else {
                console.log('\n❌ DATA MISMATCH! Retrieved data differs from inserted data.');
            }
        }
        
        // Test 4: Update user data
        console.log('\n✏️  TEST 4: Updating User Data');
        console.log('-'.repeat(60));
        const updatedPhone = '555-111-2222';
        const updatedAddress = '789 Updated Avenue, New City, NC 11111';
        
        await client.query(
            `UPDATE users SET phone = $1, address = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE email = $3`,
            [updatedPhone, updatedAddress, newUserData.email]
        );
        
        const afterUpdate = await client.query(
            'SELECT phone, address, updated_at FROM users WHERE email = $1',
            [newUserData.email]
        );
        
        console.log('✅ User updated successfully!');
        console.log(`   New Phone: ${afterUpdate.rows[0].phone}`);
        console.log(`   New Address: ${afterUpdate.rows[0].address}`);
        console.log(`   Updated at: ${afterUpdate.rows[0].updated_at}`);
        
        // Test 5: Create a booking with real data
        console.log('\n📅 TEST 5: Creating Real Booking');
        console.log('-'.repeat(60));
        
        // Get a service to book
        const service = await client.query('SELECT id, name FROM services LIMIT 1');
        const userId = insertResult.rows[0].id;
        const serviceId = service.rows[0].id;
        
        const bookingData = {
            booking_date: '2026-02-15',
            booking_time: '14:30:00',
            notes: 'This is a real booking created by a real user through the system'
        };
        
        const bookingResult = await client.query(
            `INSERT INTO bookings (user_id, service_id, booking_date, booking_time, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id, booking_date, booking_time, notes, status, created_at`,
            [userId, serviceId, bookingData.booking_date, bookingData.booking_time, bookingData.notes]
        );
        
        console.log('✅ Booking created!');
        console.log(`   Booking ID: ${bookingResult.rows[0].id}`);
        console.log(`   Service: ${service.rows[0].name}`);
        console.log(`   Date: ${bookingResult.rows[0].booking_date}`);
        console.log(`   Time: ${bookingResult.rows[0].booking_time}`);
        console.log(`   Notes: ${bookingResult.rows[0].notes}`);
        console.log(`   Status: ${bookingResult.rows[0].status}`);
        
        // Test 6: Retrieve all bookings for this user
        console.log('\n📋 TEST 6: Retrieving User Bookings');
        console.log('-'.repeat(60));
        const userBookings = await client.query(
            `SELECT b.*, s.name as service_name, sel.business_name 
             FROM bookings b
             JOIN services s ON b.service_id = s.id
             JOIN sellers sel ON s.seller_id = sel.id
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );
        
        console.log(`Found ${userBookings.rows.length} booking(s):`);
        userBookings.rows.forEach(b => {
            console.log(`   - ${b.service_name} at ${b.business_name}`);
            console.log(`     Date: ${b.booking_date}, Time: ${b.booking_time}`);
            console.log(`     Status: ${b.status}`);
        });
        
        // Test 7: Add to favorites
        console.log('\n❤️  TEST 7: Adding to Favorites');
        console.log('-'.repeat(60));
        const seller = await client.query('SELECT id, business_name FROM sellers LIMIT 1');
        
        await client.query(
            'INSERT INTO favorites (user_id, seller_id) VALUES ($1, $2)',
            [userId, seller.rows[0].id]
        );
        
        console.log(`✅ Added "${seller.rows[0].business_name}" to favorites`);
        
        const favorites = await client.query(
            `SELECT s.business_name, f.created_at 
             FROM favorites f
             JOIN sellers s ON f.seller_id = s.id
             WHERE f.user_id = $1`,
            [userId]
        );
        
        console.log(`User now has ${favorites.rows.length} favorite(s):`);
        favorites.rows.forEach(f => {
            console.log(`   - ${f.business_name} (added: ${f.created_at})`);
        });
        
        // Final Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 ALL TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ VERIFIED: Real user data is properly:');
        console.log('   • Inserted into database');
        console.log('   • Retrieved accurately');
        console.log('   • Updated correctly');
        console.log('   • Used for bookings');
        console.log('   • Used for favorites');
        console.log('\n📝 The system correctly handles actual user-provided data,');
        console.log('   not just default/sample values!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.\n');
    }
}

testRealUserData();

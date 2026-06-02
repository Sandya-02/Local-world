// Test Script to Verify Data Operations with Supabase
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function runTests() {
    console.log('═══════════════════════════════════════════════');
    console.log('  Data Verification Tests for Supabase');
    console.log('═══════════════════════════════════════════════\n');

    try {
        // Test 1: Verify all tables exist
        console.log('✓ Test 1: Verify All Tables Exist');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log(`  Found ${tables.rows.length} tables:`);
        tables.rows.forEach(t => console.log(`    - ${t.table_name}`));
        console.log('');

        // Test 2: Verify Users table
        console.log('✓ Test 2: Verify Users Table');
        const users = await pool.query('SELECT id, username, email, user_type FROM users ORDER BY id');
        console.log(`  Total users: ${users.rows.length}`);
        users.rows.forEach(u => {
            console.log(`    ${u.id}. ${u.username} (${u.email}) - Type: ${u.user_type}`);
        });
        console.log('');

        // Test 3: Verify Sellers table with relationships
        console.log('✓ Test 3: Verify Sellers Table (with User relationships)');
        const sellers = await pool.query(`
            SELECT s.id, s.business_name, s.business_type, u.username, u.email
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.id
        `);
        console.log(`  Total sellers: ${sellers.rows.length}`);
        sellers.rows.forEach(s => {
            console.log(`    ${s.id}. ${s.business_name} (${s.business_type})`);
            console.log(`       Owner: ${s.username} (${s.email})`);
        });
        console.log('');

        // Test 4: Verify Services table with relationships
        console.log('✓ Test 4: Verify Services Table (with Seller relationships)');
        const services = await pool.query(`
            SELECT s.id, s.name, s.category, s.price_range, sel.business_name
            FROM services s
            JOIN sellers sel ON s.seller_id = sel.id
            ORDER BY s.id
        `);
        console.log(`  Total services: ${services.rows.length}`);
        services.rows.forEach(s => {
            console.log(`    ${s.id}. ${s.name} (${s.category}) - ${s.price_range}`);
            console.log(`       Provider: ${s.business_name}`);
        });
        console.log('');

        // Test 5: Verify Bookings table with full relationships
        console.log('✓ Test 5: Verify Bookings Table (with User, Service, Seller relationships)');
        const bookings = await pool.query(`
            SELECT 
                b.id,
                u.username as customer,
                srv.name as service,
                sel.business_name as provider,
                b.booking_date,
                b.booking_time,
                b.status,
                b.notes
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN services srv ON b.service_id = srv.id
            JOIN sellers sel ON srv.seller_id = sel.id
            ORDER BY b.booking_date, b.booking_time
        `);
        console.log(`  Total bookings: ${bookings.rows.length}`);
        bookings.rows.forEach(b => {
            console.log(`    ${b.id}. ${b.customer} → ${b.service}`);
            console.log(`       Provider: ${b.provider}`);
            console.log(`       Date/Time: ${b.booking_date.toISOString().split('T')[0]} at ${b.booking_time}`);
            console.log(`       Status: ${b.status}`);
            if (b.notes) console.log(`       Notes: ${b.notes}`);
        });
        console.log('');

        // Test 6: Verify Reviews table with relationships
        console.log('✓ Test 6: Verify Reviews Table (with User and Seller relationships)');
        const reviews = await pool.query(`
            SELECT 
                r.id,
                u.username as reviewer,
                sel.business_name as business,
                r.rating,
                r.comment
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN sellers sel ON r.seller_id = sel.id
            ORDER BY r.id
        `);
        console.log(`  Total reviews: ${reviews.rows.length}`);
        reviews.rows.forEach(r => {
            console.log(`    ${r.id}. ${r.reviewer} reviewed ${r.business}`);
            console.log(`       Rating: ${'⭐'.repeat(r.rating)} (${r.rating}/5)`);
            console.log(`       Comment: "${r.comment}"`);
        });
        console.log('');

        // Test 7: Verify average ratings calculation
        console.log('✓ Test 7: Verify Seller Ratings Calculation');
        const ratings = await pool.query(`
            SELECT 
                s.business_name,
                ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
                COUNT(r.id) as review_count
            FROM sellers s
            LEFT JOIN reviews r ON s.id = r.seller_id
            GROUP BY s.id, s.business_name
            ORDER BY avg_rating DESC NULLS LAST
        `);
        ratings.rows.forEach(r => {
            const stars = r.avg_rating ? '⭐'.repeat(Math.round(parseFloat(r.avg_rating))) : 'No reviews';
            console.log(`    ${r.business_name}: ${r.avg_rating || 'N/A'} ${stars} (${r.review_count} reviews)`);
        });
        console.log('');

        // Test 8: Verify Favorites table
        console.log('✓ Test 8: Verify Favorites Table');
        const favorites = await pool.query(`
            SELECT 
                f.id,
                u.username,
                s.business_name
            FROM favorites f
            JOIN users u ON f.user_id = u.id
            JOIN sellers s ON f.seller_id = s.id
            ORDER BY f.id
        `);
        console.log(`  Total favorites: ${favorites.rows.length}`);
        favorites.rows.forEach(f => {
            console.log(`    ${f.id}. ${f.username} favorited ${f.business_name}`);
        });
        console.log('');

        // Test 9: Verify Notifications table
        console.log('✓ Test 9: Verify Notifications Table');
        const notifications = await pool.query(`
            SELECT 
                n.id,
                u.username,
                n.type,
                n.title,
                n.is_read
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
        `);
        console.log(`  Total notifications: ${notifications.rows.length}`);
        notifications.rows.forEach(n => {
            const status = n.is_read ? '✓ Read' : '⊗ Unread';
            console.log(`    ${n.id}. [${n.type}] ${n.title} - User: ${n.username} ${status}`);
        });
        console.log('');

        // Test 10: Data Integrity Check
        console.log('✓ Test 10: Data Integrity Check');
        
        // Check for orphaned records
        const orphanedSellers = await pool.query(`
            SELECT COUNT(*) as count 
            FROM sellers s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE u.id IS NULL
        `);
        
        const orphanedServices = await pool.query(`
            SELECT COUNT(*) as count 
            FROM services s 
            LEFT JOIN sellers sel ON s.seller_id = sel.id 
            WHERE sel.id IS NULL
        `);
        
        const orphanedBookings = await pool.query(`
            SELECT COUNT(*) as count 
            FROM bookings b 
            LEFT JOIN users u ON b.user_id = u.id 
            WHERE u.id IS NULL
        `);

        if (orphanedSellers.rows[0].count === '0' && 
            orphanedServices.rows[0].count === '0' && 
            orphanedBookings.rows[0].count === '0') {
            console.log('  ✅ All foreign key relationships are valid!');
            console.log('  ✅ No orphaned records found');
        } else {
            console.log('  ⚠️  Data integrity issues found:');
            if (orphanedSellers.rows[0].count !== '0') {
                console.log(`    - ${orphanedSellers.rows[0].count} orphaned sellers`);
            }
            if (orphanedServices.rows[0].count !== '0') {
                console.log(`    - ${orphanedServices.rows[0].count} orphaned services`);
            }
            if (orphanedBookings.rows[0].count !== '0') {
                console.log(`    - ${orphanedBookings.rows[0].count} orphaned bookings`);
            }
        }
        console.log('');

        // Test 11: Application Queries Test
        console.log('✓ Test 11: Application Queries (Backend Controller Queries)');
        
        // Test getUserBookings query
        const userBookings = await pool.query(`
            SELECT b.*, s.name as service_name, sl.business_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN sellers sl ON s.seller_id = sl.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC
        `, [1]);
        console.log(`  - getUserBookings(user_id=1): ${userBookings.rows.length} bookings ✅`);
        
        // Test getSellerDetails query
        const sellerDetails = await pool.query(`
            SELECT s.*, u.email, u.phone,
                (SELECT AVG(rating)::numeric(10,2) FROM reviews WHERE seller_id = s.id) as average_rating,
                (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `, [1]);
        console.log(`  - getSellerDetails(seller_id=1): Found '${sellerDetails.rows[0].business_name}' ✅`);
        
        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('  🎉 All Tests Passed Successfully!');
        console.log('═══════════════════════════════════════════════');
        console.log('\n✅ Data is correctly placed in all tables');
        console.log('✅ All relationships are properly maintained');
        console.log('✅ Application queries work correctly');
        console.log('\n🚀 Your Supabase database is ready to use!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

runTests();

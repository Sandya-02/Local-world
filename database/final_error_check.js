const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

async function comprehensiveCheck() {
    console.log('=' .repeat(70));
    console.log('COMPREHENSIVE DATABASE ERROR CHECK');
    console.log('='.repeat(70));
    
    let errors = [];
    let warnings = [];
    
    try {
        // 1. Check for orphaned records in bookings
        console.log('\n1️⃣  Checking BOOKINGS for orphaned records...');
        const orphanedBookings = await pool.query(`
            SELECT b.id, b.user_id, b.service_id 
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN services s ON b.service_id = s.id
            WHERE u.id IS NULL OR s.id IS NULL
        `);
        
        if (orphanedBookings.rows.length > 0) {
            errors.push(`❌ ${orphanedBookings.rows.length} orphaned booking(s) found`);
            orphanedBookings.rows.forEach(row => {
                console.log(`   - Booking ID ${row.id}: user_id=${row.user_id}, service_id=${row.service_id}`);
            });
        } else {
            console.log('   ✅ No orphaned bookings');
        }
        
        // 2. Check for orphaned services
        console.log('\n2️⃣  Checking SERVICES for orphaned records...');
        const orphanedServices = await pool.query(`
            SELECT s.id, s.seller_id, s.name
            FROM services s
            LEFT JOIN sellers sl ON s.seller_id = sl.id
            WHERE sl.id IS NULL
        `);
        
        if (orphanedServices.rows.length > 0) {
            errors.push(`❌ ${orphanedServices.rows.length} orphaned service(s) found`);
            orphanedServices.rows.forEach(row => {
                console.log(`   - Service ID ${row.id}: ${row.name} (seller_id=${row.seller_id})`);
            });
        } else {
            console.log('   ✅ No orphaned services');
        }
        
        // 3. Check for orphaned sellers
        console.log('\n3️⃣  Checking SELLERS for orphaned records...');
        const orphanedSellers = await pool.query(`
            SELECT sl.id, sl.business_name, sl.user_id
            FROM sellers sl
            LEFT JOIN users u ON sl.user_id = u.id
            WHERE u.id IS NULL
        `);
        
        if (orphanedSellers.rows.length > 0) {
            errors.push(`❌ ${orphanedSellers.rows.length} orphaned seller(s) found`);
            orphanedSellers.rows.forEach(row => {
                console.log(`   - Seller ID ${row.id}: ${row.business_name} (user_id=${row.user_id})`);
            });
        } else {
            console.log('   ✅ No orphaned sellers');
        }
        
        // 4. Check reviews
        console.log('\n4️⃣  Checking REVIEWS for orphaned records...');
        const orphanedReviews = await pool.query(`
            SELECT r.id, r.user_id, r.seller_id
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN sellers sl ON r.seller_id = sl.id
            WHERE u.id IS NULL OR sl.id IS NULL
        `);
        
        if (orphanedReviews.rows.length > 0) {
            errors.push(`❌ ${orphanedReviews.rows.length} orphaned review(s) found`);
            orphanedReviews.rows.forEach(row => {
                console.log(`   - Review ID ${row.id}: user_id=${row.user_id}, seller_id=${row.seller_id}`);
            });
        } else {
            console.log('   ✅ No orphaned reviews');
        }
        
        // 5. Check favorites
        console.log('\n5️⃣  Checking FAVORITES for orphaned records...');
        const orphanedFavorites = await pool.query(`
            SELECT f.id, f.user_id, f.seller_id
            FROM favorites f
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN sellers sl ON f.seller_id = sl.id
            WHERE u.id IS NULL OR sl.id IS NULL
        `);
        
        if (orphanedFavorites.rows.length > 0) {
            errors.push(`❌ ${orphanedFavorites.rows.length} orphaned favorite(s) found`);
            orphanedFavorites.rows.forEach(row => {
                console.log(`   - Favorite ID ${row.id}: user_id=${row.user_id}, seller_id=${row.seller_id}`);
            });
        } else {
            console.log('   ✅ No orphaned favorites');
        }
        
        // 6. Check messages
        console.log('\n6️⃣  Checking MESSAGES for orphaned records...');
        const orphanedMessages = await pool.query(`
            SELECT m.id, m.sender_id, m.receiver_id
            FROM messages m
            LEFT JOIN users u1 ON m.sender_id = u1.id
            LEFT JOIN users u2 ON m.receiver_id = u2.id
            WHERE u1.id IS NULL OR u2.id IS NULL
        `);
        
        if (orphanedMessages.rows.length > 0) {
            errors.push(`❌ ${orphanedMessages.rows.length} orphaned message(s) found`);
            orphanedMessages.rows.forEach(row => {
                console.log(`   - Message ID ${row.id}: sender_id=${row.sender_id}, receiver_id=${row.receiver_id}`);
            });
        } else {
            console.log('   ✅ No orphaned messages');
        }
        
        // 7. Check notifications
        console.log('\n7️⃣  Checking NOTIFICATIONS for orphaned records...');
        const orphanedNotifications = await pool.query(`
            SELECT n.id, n.user_id
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            WHERE u.id IS NULL
        `);
        
        if (orphanedNotifications.rows.length > 0) {
            errors.push(`❌ ${orphanedNotifications.rows.length} orphaned notification(s) found`);
            orphanedNotifications.rows.forEach(row => {
                console.log(`   - Notification ID ${row.id}: user_id=${row.user_id}`);
            });
        } else {
            console.log('   ✅ No orphaned notifications');
        }
        
        // 8. Check for duplicate users
        console.log('\n8️⃣  Checking for duplicate USERS (by email)...');
        const duplicateUsers = await pool.query(`
            SELECT email, COUNT(*) as count
            FROM users
            GROUP BY email
            HAVING COUNT(*) > 1
        `);
        
        if (duplicateUsers.rows.length > 0) {
            warnings.push(`⚠️  ${duplicateUsers.rows.length} duplicate email(s) found`);
            duplicateUsers.rows.forEach(row => {
                console.log(`   ⚠️  Email '${row.email}' appears ${row.count} times`);
            });
        } else {
            console.log('   ✅ No duplicate emails');
        }
        
        // 9. Check for invalid ratings
        console.log('\n9️⃣  Checking for invalid RATINGS...');
        const invalidRatings = await pool.query(`
            SELECT id, rating
            FROM reviews
            WHERE rating < 1 OR rating > 5
        `);
        
        if (invalidRatings.rows.length > 0) {
            errors.push(`❌ ${invalidRatings.rows.length} invalid rating(s) found`);
            invalidRatings.rows.forEach(row => {
                console.log(`   - Review ID ${row.id}: rating=${row.rating}`);
            });
        } else {
            console.log('   ✅ All ratings are valid (1-5)');
        }
        
        // 10. Check for invalid booking status
        console.log('\n🔟  Checking for invalid BOOKING status...');
        const invalidStatus = await pool.query(`
            SELECT id, status
            FROM bookings
            WHERE status NOT IN ('pending', 'confirmed', 'completed', 'cancelled')
        `);
        
        if (invalidStatus.rows.length > 0) {
            errors.push(`❌ ${invalidStatus.rows.length} invalid booking status(es) found`);
            invalidStatus.rows.forEach(row => {
                console.log(`   - Booking ID ${row.id}: status='${row.status}'`);
            });
        } else {
            console.log('   ✅ All booking statuses are valid');
        }
        
        // 11. Check users table duplicate columns issue
        console.log('\n1️⃣1️⃣  Checking USERS table structure for duplicate columns...');
        const userColumns = await pool.query(`
            SELECT column_name, COUNT(*) as count
            FROM information_schema.columns
            WHERE table_name = 'users'
            GROUP BY column_name
            HAVING COUNT(*) > 1
        `);
        
        if (userColumns.rows.length > 0) {
            warnings.push(`⚠️  ${userColumns.rows.length} duplicate column name(s) in users table`);
            userColumns.rows.forEach(row => {
                console.log(`   ⚠️  Column '${row.column_name}' appears ${row.count} times`);
            });
            console.log('   💡 This suggests you may have both auth.users (Supabase) and public.users tables');
        } else {
            console.log('   ✅ No duplicate column names');
        }
        
        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('SUMMARY');
        console.log('='.repeat(70));
        
        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ ALL CHECKS PASSED! No errors or warnings found.');
        } else {
            if (errors.length > 0) {
                console.log(`\n❌ ERRORS FOUND (${errors.length}):`);
                errors.forEach(err => console.log(`   ${err}`));
            }
            if (warnings.length > 0) {
                console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
                warnings.forEach(warn => console.log(`   ${warn}`));
            }
        }
        
        console.log('='.repeat(70));
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
        console.log('\n✅ Database connection closed.');
    }
}

comprehensiveCheck();

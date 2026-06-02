// Quick Database Verification
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function quickCheck() {
    console.log('🔍 Quick Database Check\n');
    
    try {
        // Count all records
        const counts = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users,
                (SELECT COUNT(*) FROM sellers) as sellers,
                (SELECT COUNT(*) FROM services) as services,
                (SELECT COUNT(*) FROM bookings) as bookings,
                (SELECT COUNT(*) FROM reviews) as reviews,
                (SELECT COUNT(*) FROM favorites) as favorites,
                (SELECT COUNT(*) FROM messages) as messages,
                (SELECT COUNT(*) FROM notifications) as notifications
        `);
        
        const data = counts.rows[0];
        
        console.log('📊 Record Counts:');
        console.log(`   Users: ${data.users}`);
        console.log(`   Sellers: ${data.sellers}`);
        console.log(`   Services: ${data.services}`);
        console.log(`   Bookings: ${data.bookings}`);
        console.log(`   Reviews: ${data.reviews}`);
        console.log(`   Favorites: ${data.favorites}`);
        console.log(`   Messages: ${data.messages}`);
        console.log(`   Notifications: ${data.notifications}\n`);
        
        // Check relationships
        const integrity = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM sellers s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL) as bad_sellers,
                (SELECT COUNT(*) FROM services s LEFT JOIN sellers sel ON s.seller_id = sel.id WHERE sel.id IS NULL) as bad_services,
                (SELECT COUNT(*) FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE u.id IS NULL) as bad_bookings
        `);
        
        const issues = integrity.rows[0];
        
        if (issues.bad_sellers === '0' && issues.bad_services === '0' && issues.bad_bookings === '0') {
            console.log('✅ All relationships are valid!');
        } else {
            console.log('⚠️  Issues found:');
            if (issues.bad_sellers !== '0') console.log(`   ${issues.bad_sellers} orphaned sellers`);
            if (issues.bad_services !== '0') console.log(`   ${issues.bad_services} orphaned services`);
            if (issues.bad_bookings !== '0') console.log(`   ${issues.bad_bookings} orphaned bookings`);
        }
        
        console.log('\n✨ Database is healthy!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

quickCheck();

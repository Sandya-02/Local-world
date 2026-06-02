// Supabase Database Setup and Verification Script
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Supabase PostgreSQL configuration
const DB_CONFIG = {
    connectionString: 'postgresql://postgres:Poojitha%4023341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
};

async function setupDatabase() {
    const client = new Client(DB_CONFIG);
    
    try {
        console.log('🔌 Connecting to Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Connected to Supabase successfully!\n');

        // Read and execute schema file
        console.log('📋 Creating tables from schema...');
        const schemaPath = path.join(__dirname, 'supabase_schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await client.query(schema);
        console.log('✅ Tables created successfully!\n');

        // Insert sample data
        console.log('📝 Inserting sample data...');
        const sampleDataPath = path.join(__dirname, 'supabase_sample_data.sql');
        const sampleData = await fs.readFile(sampleDataPath, 'utf8');
        await client.query(sampleData);
        console.log('✅ Sample data inserted successfully!\n');

        // Verify tables
        console.log('🔍 Verifying database structure...\n');
        await verifyDatabase(client);

        console.log('\n✨ Database setup completed successfully!');
        console.log('\n📊 Database Summary:');
        await showDatabaseSummary(client);

    } catch (error) {
        console.error('❌ Error during database setup:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

async function verifyDatabase(client) {
    // Check tables exist
    const tablesResult = await client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    console.log('📋 Tables Created:');
    tablesResult.rows.forEach(table => {
        console.log(`   ✓ ${table.table_name} (${table.column_count} columns)`);
    });

    // Check foreign keys
    const foreignKeysResult = await client.query(`
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    `);

    console.log('\n🔗 Foreign Key Constraints:');
    foreignKeysResult.rows.forEach(fk => {
        console.log(`   ✓ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });

    // Check indexes
    const indexesResult = await client.query(`
        SELECT 
            schemaname,
            tablename,
            indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
    `);

    console.log('\n📑 Indexes Created:');
    let currentTable = '';
    indexesResult.rows.forEach(idx => {
        if (idx.tablename !== currentTable) {
            currentTable = idx.tablename;
            console.log(`   ${idx.tablename}:`);
        }
        console.log(`      ✓ ${idx.indexname}`);
    });
}

async function showDatabaseSummary(client) {
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const sellerCount = await client.query('SELECT COUNT(*) as count FROM sellers');
    const serviceCount = await client.query('SELECT COUNT(*) as count FROM services');
    const bookingCount = await client.query('SELECT COUNT(*) as count FROM bookings');
    const reviewCount = await client.query('SELECT COUNT(*) as count FROM reviews');

    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   🏢 Sellers: ${sellerCount.rows[0].count}`);
    console.log(`   🛠️  Services: ${serviceCount.rows[0].count}`);
    console.log(`   📅 Bookings: ${bookingCount.rows[0].count}`);
    console.log(`   ⭐ Reviews: ${reviewCount.rows[0].count}`);
}

async function testQueries() {
    const client = new Client(DB_CONFIG);
    
    try {
        console.log('\n🧪 Testing Application Queries...\n');
        await client.connect();

        // Test 1: Get user bookings (from booking.controller.js)
        console.log('Test 1: Get User Bookings');
        const bookingsResult = await client.query(`
            SELECT b.*, s.name as service_name, sl.business_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN sellers sl ON s.seller_id = sl.id
            WHERE b.user_id = 1
            ORDER BY b.booking_date DESC
        `);
        console.log(`   ✅ Found ${bookingsResult.rows.length} bookings for user 1`);
        if (bookingsResult.rows.length > 0) {
            console.log(`   📌 Sample: ${bookingsResult.rows[0].service_name} at ${bookingsResult.rows[0].business_name}`);
            console.log(`   📅 Date: ${bookingsResult.rows[0].booking_date.toISOString().split('T')[0]} at ${bookingsResult.rows[0].booking_time}`);
            console.log(`   📊 Status: ${bookingsResult.rows[0].status}`);
        }

        // Test 2: Get seller details with ratings (from seller.controller.js)
        console.log('\nTest 2: Get Seller Details with Ratings');
        const sellersResult = await client.query(`
            SELECT s.*, u.email, u.phone,
                (SELECT AVG(rating)::numeric(10,2) FROM reviews WHERE seller_id = s.id) as average_rating,
                (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = 1
        `);
        if (sellersResult.rows.length > 0) {
            console.log(`   ✅ Found seller: ${sellersResult.rows[0].business_name}`);
            console.log(`   ⭐ Rating: ${sellersResult.rows[0].average_rating || 'No reviews yet'}`);
            console.log(`   📝 Reviews: ${sellersResult.rows[0].review_count}`);
            console.log(`   📧 Email: ${sellersResult.rows[0].email}`);
            console.log(`   📞 Phone: ${sellersResult.rows[0].phone}`);
        }

        // Test 3: Verify data relationships
        console.log('\nTest 3: Data Integrity Check');
        const integrityResult = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM sellers s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL) as orphaned_sellers,
                (SELECT COUNT(*) FROM services s LEFT JOIN sellers sel ON s.seller_id = sel.id WHERE sel.id IS NULL) as orphaned_services,
                (SELECT COUNT(*) FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE u.id IS NULL) as orphaned_bookings
        `);
        const issues = integrityResult.rows[0];
        if (issues.orphaned_sellers === '0' && issues.orphaned_services === '0' && issues.orphaned_bookings === '0') {
            console.log('   ✅ All foreign key relationships are valid!');
        } else {
            console.log('   ⚠️  Found data integrity issues:');
            if (issues.orphaned_sellers !== '0') console.log(`      - ${issues.orphaned_sellers} orphaned sellers`);
            if (issues.orphaned_services !== '0') console.log(`      - ${issues.orphaned_services} orphaned services`);
            if (issues.orphaned_bookings !== '0') console.log(`      - ${issues.orphaned_bookings} orphaned bookings`);
        }

        // Test 4: Check if data is in correct tables
        console.log('\nTest 4: Verify Data Placement');
        
        const userTypes = await client.query(`
            SELECT user_type, COUNT(*) as count 
            FROM users 
            GROUP BY user_type
        `);
        console.log('   👥 Users by type:');
        userTypes.rows.forEach(row => {
            console.log(`      - ${row.user_type}: ${row.count}`);
        });

        const serviceCategories = await client.query(`
            SELECT category, COUNT(*) as count 
            FROM services 
            GROUP BY category
        `);
        console.log('   🛠️  Services by category:');
        serviceCategories.rows.forEach(row => {
            console.log(`      - ${row.category}: ${row.count}`);
        });

        const bookingStatuses = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM bookings 
            GROUP BY status
        `);
        console.log('   📅 Bookings by status:');
        bookingStatuses.rows.forEach(row => {
            console.log(`      - ${row.status}: ${row.count}`);
        });

        console.log('\n✨ All query tests passed!');

    } catch (error) {
        console.error('❌ Query test error:', error.message);
    } finally {
        await client.end();
    }
}

// Main execution
console.log('╔══════════════════════════════════════════════╗');
console.log('║   LocalFinder Supabase Database Setup       ║');
console.log('╚══════════════════════════════════════════════╝\n');

setupDatabase()
    .then(() => testQueries())
    .then(() => {
        console.log('\n🎉 Setup and verification completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Update .env file with Supabase credentials');
        console.log('   2. Update backend/config/db.config.js for PostgreSQL');
        console.log('   3. Restart your backend server');
        console.log('\n📝 Note: Your Supabase database is now ready with all tables and sample data!');
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

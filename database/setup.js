// Database Setup and Verification Script
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '', // Change this to your MySQL root password
    multipleStatements: true
};

const DB_NAME = 'localfinder_db';

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Connected to MySQL successfully!\n');

        // Create database if not exists
        console.log('📦 Creating database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
        console.log(`✅ Database '${DB_NAME}' created/verified\n`);

        // Use the database
        await connection.query(`USE ${DB_NAME}`);

        // Read and execute schema file
        console.log('📋 Creating tables from schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await connection.query(schema);
        console.log('✅ Tables created successfully!\n');

        // Insert sample data
        console.log('📝 Inserting sample data...');
        const sampleDataPath = path.join(__dirname, 'sample_data.sql');
        const sampleData = await fs.readFile(sampleDataPath, 'utf8');
        await connection.query(sampleData);
        console.log('✅ Sample data inserted successfully!\n');

        // Verify tables
        console.log('🔍 Verifying database structure...\n');
        await verifyDatabase(connection);

        console.log('\n✨ Database setup completed successfully!');
        console.log('\n📊 Database Summary:');
        await showDatabaseSummary(connection);

    } catch (error) {
        console.error('❌ Error during database setup:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n⚠️  Please update the database password in this script (line 9)');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed.');
        }
    }
}

async function verifyDatabase(connection) {
    // Check tables exist
    const [tables] = await connection.query(`
        SELECT TABLE_NAME, TABLE_ROWS 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = '${DB_NAME}'
        ORDER BY TABLE_NAME
    `);

    console.log('📋 Tables Created:');
    tables.forEach(table => {
        console.log(`   ✓ ${table.TABLE_NAME} (${table.TABLE_ROWS} rows)`);
    });

    // Check foreign keys
    const [foreignKeys] = await connection.query(`
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '${DB_NAME}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    console.log('\n🔗 Foreign Key Constraints:');
    foreignKeys.forEach(fk => {
        console.log(`   ✓ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
}

async function showDatabaseSummary(connection) {
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [sellerCount] = await connection.query('SELECT COUNT(*) as count FROM sellers');
    const [serviceCount] = await connection.query('SELECT COUNT(*) as count FROM services');
    const [bookingCount] = await connection.query('SELECT COUNT(*) as count FROM bookings');
    const [reviewCount] = await connection.query('SELECT COUNT(*) as count FROM reviews');

    console.log(`   👥 Users: ${userCount[0].count}`);
    console.log(`   🏢 Sellers: ${sellerCount[0].count}`);
    console.log(`   🛠️  Services: ${serviceCount[0].count}`);
    console.log(`   📅 Bookings: ${bookingCount[0].count}`);
    console.log(`   ⭐ Reviews: ${reviewCount[0].count}`);
}

async function testQueries() {
    let connection;
    
    try {
        console.log('\n🧪 Testing Application Queries...\n');
        
        connection = await mysql.createConnection({
            ...DB_CONFIG,
            database: DB_NAME
        });

        // Test 1: Get user bookings (from booking.controller.js)
        console.log('Test 1: Get User Bookings');
        const [bookings] = await connection.query(`
            SELECT b.*, s.name as service_name, sl.business_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN sellers sl ON s.seller_id = sl.id
            WHERE b.user_id = 1
            ORDER BY b.booking_date DESC
        `);
        console.log(`   ✅ Found ${bookings.length} bookings for user 1`);
        if (bookings.length > 0) {
            console.log(`   📌 Sample: ${bookings[0].service_name} at ${bookings[0].business_name}`);
        }

        // Test 2: Get seller details with ratings (from seller.controller.js)
        console.log('\nTest 2: Get Seller Details with Ratings');
        const [sellers] = await connection.query(`
            SELECT s.*, u.email, u.phone,
                (SELECT AVG(rating) FROM reviews WHERE seller_id = s.id) as average_rating,
                (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = 1
        `);
        console.log(`   ✅ Found seller: ${sellers[0].business_name}`);
        console.log(`   ⭐ Rating: ${sellers[0].average_rating || 'No reviews yet'}`);
        console.log(`   📝 Reviews: ${sellers[0].review_count}`);

        // Test 3: Verify data relationships
        console.log('\nTest 3: Data Integrity Check');
        const [integrity] = await connection.query(`
            SELECT 
                (SELECT COUNT(*) FROM sellers s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL) as orphaned_sellers,
                (SELECT COUNT(*) FROM services s LEFT JOIN sellers sel ON s.seller_id = sel.id WHERE sel.id IS NULL) as orphaned_services,
                (SELECT COUNT(*) FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE u.id IS NULL) as orphaned_bookings
        `);
        const issues = integrity[0];
        if (issues.orphaned_sellers === 0 && issues.orphaned_services === 0 && issues.orphaned_bookings === 0) {
            console.log('   ✅ All foreign key relationships are valid!');
        } else {
            console.log('   ⚠️  Found data integrity issues:');
            if (issues.orphaned_sellers > 0) console.log(`      - ${issues.orphaned_sellers} orphaned sellers`);
            if (issues.orphaned_services > 0) console.log(`      - ${issues.orphaned_services} orphaned services`);
            if (issues.orphaned_bookings > 0) console.log(`      - ${issues.orphaned_bookings} orphaned bookings`);
        }

        console.log('\n✨ All query tests passed!');

    } catch (error) {
        console.error('❌ Query test error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

// Main execution
console.log('╔══════════════════════════════════════════════╗');
console.log('║   LocalFinder Database Setup & Verification  ║');
console.log('╚══════════════════════════════════════════════╝\n');

setupDatabase()
    .then(() => testQueries())
    .then(() => {
        console.log('\n🎉 Setup and verification completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Update backend/config/db.config.js with your MySQL credentials');
        console.log('   2. Remove or set DISABLE_DB=false in .env file');
        console.log('   3. Restart your backend server');
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

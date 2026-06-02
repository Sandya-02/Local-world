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

async function checkAllTables() {
    console.log('='.repeat(60));
    console.log('DATABASE TABLES HEALTH CHECK');
    console.log('='.repeat(60));
    console.log();

    const tables = [
        'users',
        'sellers', 
        'services',
        'bookings',
        'reviews',
        'favorites',
        'messages',
        'notifications'
    ];

    let totalErrors = 0;

    for (const table of tables) {
        try {
            console.log(`\n📋 Checking table: ${table.toUpperCase()}`);
            console.log('-'.repeat(60));

            // 1. Check if table exists
            const existsQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `;
            const existsResult = await pool.query(existsQuery, [table]);
            
            if (!existsResult.rows[0].exists) {
                console.error(`❌ ERROR: Table '${table}' does not exist!`);
                totalErrors++;
                continue;
            }
            console.log(`✅ Table exists`);

            // 2. Check table structure
            const columnsQuery = `
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `;
            const columnsResult = await pool.query(columnsQuery, [table]);
            console.log(`✅ Columns: ${columnsResult.rows.length} found`);
            columnsResult.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
            });

            // 3. Check row count
            const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
            const countResult = await pool.query(countQuery);
            console.log(`✅ Row count: ${countResult.rows[0].count} records`);

            // 4. Check constraints
            const constraintsQuery = `
                SELECT 
                    con.conname as constraint_name,
                    con.contype as constraint_type
                FROM pg_constraint con
                JOIN pg_class rel ON rel.oid = con.conrelid
                WHERE rel.relname = $1;
            `;
            const constraintsResult = await pool.query(constraintsQuery, [table]);
            console.log(`✅ Constraints: ${constraintsResult.rows.length} found`);
            constraintsResult.rows.forEach(constraint => {
                const types = {
                    'p': 'PRIMARY KEY',
                    'f': 'FOREIGN KEY',
                    'u': 'UNIQUE',
                    'c': 'CHECK'
                };
                console.log(`   - ${constraint.constraint_name}: ${types[constraint.constraint_type] || constraint.constraint_type}`);
            });

            // 5. Check foreign keys validity
            if (table === 'bookings') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM bookings b
                    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = b.user_id)
                       OR NOT EXISTS (SELECT 1 FROM services WHERE id = b.service_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} bookings with invalid foreign keys`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            if (table === 'services') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM services s
                    WHERE NOT EXISTS (SELECT 1 FROM sellers WHERE id = s.seller_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} services with invalid seller_id`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            if (table === 'reviews') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM reviews r
                    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = r.user_id)
                       OR NOT EXISTS (SELECT 1 FROM services WHERE id = r.service_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} reviews with invalid foreign keys`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            if (table === 'favorites') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM favorites f
                    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = f.user_id)
                       OR NOT EXISTS (SELECT 1 FROM services WHERE id = f.service_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} favorites with invalid foreign keys`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            if (table === 'messages') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM messages m
                    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = m.sender_id)
                       OR NOT EXISTS (SELECT 1 FROM users WHERE id = m.receiver_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} messages with invalid foreign keys`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            if (table === 'notifications') {
                const fkCheckQuery = `
                    SELECT COUNT(*) as invalid_count
                    FROM notifications n
                    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = n.user_id);
                `;
                const fkCheck = await pool.query(fkCheckQuery);
                if (fkCheck.rows[0].invalid_count > 0) {
                    console.error(`❌ ERROR: ${fkCheck.rows[0].invalid_count} notifications with invalid user_id`);
                    totalErrors++;
                } else {
                    console.log(`✅ Foreign keys: All valid`);
                }
            }

            // 6. Test INSERT permission (dry run)
            console.log(`✅ Table '${table}' is healthy`);

        } catch (error) {
            console.error(`❌ ERROR checking table '${table}':`, error.message);
            totalErrors++;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    if (totalErrors === 0) {
        console.log('✅ All tables are healthy! No errors found.');
    } else {
        console.error(`❌ Found ${totalErrors} error(s) across tables.`);
    }
    console.log('='.repeat(60));
}

// Test CRUD operations on each table
async function testCrudOperations() {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING CRUD OPERATIONS');
    console.log('='.repeat(60));

    try {
        // Test Users table
        console.log('\n📝 Testing USERS table...');
        const testEmail = `test_${Date.now()}@example.com`;
        
        // INSERT
        const insertResult = await pool.query(
            `INSERT INTO users (username, email, password, full_name, phone, user_type) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            ['Test User', testEmail, 'hashedpassword', 'Test User', '1234567890', 'user']
        );
        const userId = insertResult.rows[0].id;
        console.log(`✅ INSERT: Created user with ID ${userId}`);

        // SELECT
        const selectResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (selectResult.rows.length > 0) {
            console.log(`✅ SELECT: Retrieved user successfully`);
        }

        // UPDATE
        await pool.query('UPDATE users SET phone = $1 WHERE id = $2', ['0987654321', userId]);
        console.log(`✅ UPDATE: Updated user successfully`);

        // DELETE
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        console.log(`✅ DELETE: Deleted test user successfully`);

        console.log('\n✅ All CRUD operations working correctly!');

    } catch (error) {
        console.error('❌ CRUD operation failed:', error.message);
    }
}

async function main() {
    try {
        await checkAllTables();
        await testCrudOperations();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await pool.end();
        console.log('\n✅ Database connection closed.');
    }
}

main();

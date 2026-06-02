-- Database Verification Queries
-- Run these queries to verify the database structure and data integrity

-- 1. Check all tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'localfinder_db'
ORDER BY 
    TABLE_NAME;

-- 2. Verify users table structure and data
SELECT 'USERS TABLE' as TABLE_CHECK;
DESCRIBE users;
SELECT COUNT(*) as total_users, 
       SUM(CASE WHEN user_type = 'user' THEN 1 ELSE 0 END) as customers,
       SUM(CASE WHEN user_type = 'seller' THEN 1 ELSE 0 END) as sellers
FROM users;

-- 3. Verify sellers table and relationships
SELECT 'SELLERS TABLE' as TABLE_CHECK;
DESCRIBE sellers;
SELECT s.id, s.business_name, u.username, u.email, s.business_type
FROM sellers s
JOIN users u ON s.user_id = u.id;

-- 4. Verify services table and relationships
SELECT 'SERVICES TABLE' as TABLE_CHECK;
DESCRIBE services;
SELECT s.id, s.name, s.category, sel.business_name as seller
FROM services s
JOIN sellers sel ON s.seller_id = sel.id;

-- 5. Verify bookings table and relationships
SELECT 'BOOKINGS TABLE' as TABLE_CHECK;
DESCRIBE bookings;
SELECT 
    b.id,
    u.username as customer,
    srv.name as service,
    sel.business_name as provider,
    b.booking_date,
    b.booking_time,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN services srv ON b.service_id = srv.id
JOIN sellers sel ON srv.seller_id = sel.id
ORDER BY b.booking_date;

-- 6. Verify reviews table and relationships
SELECT 'REVIEWS TABLE' as TABLE_CHECK;
DESCRIBE reviews;
SELECT 
    r.id,
    u.username as reviewer,
    s.business_name as business,
    r.rating,
    r.comment
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN sellers s ON r.seller_id = s.id;

-- 7. Check average ratings per seller (as used in the application)
SELECT 
    s.business_name,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as review_count
FROM sellers s
LEFT JOIN reviews r ON s.id = r.seller_id
GROUP BY s.id, s.business_name;

-- 8. Verify foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'localfinder_db'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- 9. Test the getUserBookings query (as used in booking.controller.js)
SELECT 'USER BOOKINGS QUERY TEST' as TEST_NAME;
SELECT b.*, s.name as service_name, sl.business_name
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN sellers sl ON s.seller_id = sl.id
WHERE b.user_id = 1
ORDER BY b.booking_date DESC;

-- 10. Test the getSellerDetails query (as used in seller.controller.js)
SELECT 'SELLER DETAILS QUERY TEST' as TEST_NAME;
SELECT s.*, u.email, u.phone,
    (SELECT AVG(rating) FROM reviews WHERE seller_id = s.id) as average_rating,
    (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
FROM sellers s
JOIN users u ON s.user_id = u.id
WHERE s.id = 1;

-- 11. Check data integrity - orphaned records
SELECT 'DATA INTEGRITY CHECK' as CHECK_NAME;

-- Check for sellers without valid user_id
SELECT 'Sellers with invalid user_id:' as issue;
SELECT s.id, s.business_name 
FROM sellers s
LEFT JOIN users u ON s.user_id = u.id
WHERE u.id IS NULL;

-- Check for services without valid seller_id
SELECT 'Services with invalid seller_id:' as issue;
SELECT srv.id, srv.name 
FROM services srv
LEFT JOIN sellers s ON srv.seller_id = s.id
WHERE s.id IS NULL;

-- Check for bookings with invalid references
SELECT 'Bookings with invalid user_id:' as issue;
SELECT b.id 
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
WHERE u.id IS NULL;

SELECT 'Bookings with invalid service_id:' as issue;
SELECT b.id 
FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
WHERE s.id IS NULL;

-- 12. Performance check - verify indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
FROM 
    information_schema.STATISTICS
WHERE 
    TABLE_SCHEMA = 'localfinder_db'
GROUP BY 
    TABLE_NAME, INDEX_NAME
ORDER BY 
    TABLE_NAME, INDEX_NAME;

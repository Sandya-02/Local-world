# How to Verify Database Data Placement

You have multiple methods to verify that data is correctly placed in all tables:

---

## Method 1: Automated Test Scripts ✅ (Recommended)

### Full Verification (Detailed):
```bash
node database/test_data_placement.js
```

**What it checks:**
- ✅ All 8 tables exist
- ✅ Record counts in each table
- ✅ Foreign key relationships
- ✅ Data integrity (no orphaned records)
- ✅ Application queries work correctly
- ✅ Shows sample data from each table

### Quick Check (Summary):
```bash
node database/quick_check.js
```

**What it checks:**
- ✅ Record counts for all tables
- ✅ Basic relationship validation
- ✅ Quick health status

---

## Method 2: Using Supabase Dashboard 🌐

1. **Open Supabase Dashboard:**
   - Go to: https://gfaqgcrjgtkofltyfcbr.supabase.co
   - Login with your credentials

2. **View Tables:**
   - Click "Table Editor" in the left sidebar
   - Select any table to view its data
   - You can add, edit, or delete records directly

3. **Run SQL Queries:**
   - Click "SQL Editor" in the left sidebar
   - Run any custom queries (see examples below)

---

## Method 3: SQL Queries You Can Run

### Check All Table Counts:
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM sellers) as sellers,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM bookings) as bookings,
    (SELECT COUNT(*) FROM reviews) as reviews,
    (SELECT COUNT(*) FROM favorites) as favorites,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM notifications) as notifications;
```

### View All Users:
```sql
SELECT id, username, email, user_type, created_at 
FROM users 
ORDER BY id;
```

### View Sellers with Their Owners:
```sql
SELECT 
    s.id,
    s.business_name,
    s.business_type,
    u.username as owner,
    u.email
FROM sellers s
JOIN users u ON s.user_id = u.id
ORDER BY s.id;
```

### View Services with Seller Info:
```sql
SELECT 
    srv.id,
    srv.name,
    srv.category,
    srv.price_range,
    s.business_name as seller
FROM services srv
JOIN sellers s ON srv.seller_id = s.id
ORDER BY srv.id;
```

### View Bookings with Full Details:
```sql
SELECT 
    b.id,
    u.username as customer,
    srv.name as service,
    s.business_name as provider,
    b.booking_date,
    b.booking_time,
    b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN services srv ON b.service_id = srv.id
JOIN sellers s ON srv.seller_id = s.id
ORDER BY b.booking_date;
```

### View Reviews with Ratings:
```sql
SELECT 
    r.id,
    u.username as reviewer,
    s.business_name as business,
    r.rating,
    r.comment,
    r.created_at
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN sellers s ON r.seller_id = s.id
ORDER BY r.created_at DESC;
```

### Check Seller Ratings:
```sql
SELECT 
    s.business_name,
    ROUND(AVG(r.rating)::numeric, 2) as avg_rating,
    COUNT(r.id) as review_count
FROM sellers s
LEFT JOIN reviews r ON s.id = r.seller_id
GROUP BY s.id, s.business_name
ORDER BY avg_rating DESC NULLS LAST;
```

### Verify Data Integrity (No Orphaned Records):
```sql
-- Check for orphaned sellers
SELECT COUNT(*) as orphaned_sellers
FROM sellers s 
LEFT JOIN users u ON s.user_id = u.id 
WHERE u.id IS NULL;

-- Check for orphaned services
SELECT COUNT(*) as orphaned_services
FROM services s 
LEFT JOIN sellers sel ON s.seller_id = sel.id 
WHERE sel.id IS NULL;

-- Check for orphaned bookings
SELECT COUNT(*) as orphaned_bookings
FROM bookings b 
LEFT JOIN users u ON b.user_id = u.id 
WHERE u.id IS NULL;

-- All counts should be 0!
```

---

## Method 4: Using PostgreSQL Client (Optional)

If you have `psql` installed:

```bash
psql "postgresql://postgres:Poojitha@23341A1230@db.gfaqgcrjgtkofltyfcbr.supabase.co:5432/postgres"
```

Then run any SQL queries.

---

## Method 5: Create a Custom Verification Script

You can create your own verification script. Example:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function myCustomCheck() {
    // Check specific data
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['john@example.com']);
    console.log(result.rows);
    await pool.end();
}

myCustomCheck();
```

---

## What to Verify:

### ✅ Table Structure:
- [ ] All 8 tables exist
- [ ] Correct number of columns in each table
- [ ] Indexes are created

### ✅ Data Presence:
- [ ] Users table has records
- [ ] Sellers linked to valid users
- [ ] Services linked to valid sellers
- [ ] Bookings linked to valid users and services
- [ ] Reviews linked to valid users and sellers

### ✅ Relationships:
- [ ] No orphaned records (foreign keys valid)
- [ ] Cascade deletes work properly
- [ ] Unique constraints enforced

### ✅ Data Quality:
- [ ] Passwords are hashed
- [ ] Dates are in correct format
- [ ] Enum values are valid (user_type, status, etc.)
- [ ] Email addresses are unique

---

## Expected Data (Sample):

**Users:** 5 (2 customers, 3 sellers)
**Sellers:** 3 businesses
**Services:** 9 services (3 per seller)
**Bookings:** 5 bookings (various statuses)
**Reviews:** 4 reviews (with ratings)
**Favorites:** 4 saved sellers
**Messages:** 0 (ready for use)
**Notifications:** 4 notifications

---

## Troubleshooting:

### If Test Scripts Fail:
1. Check database connection in `.env` file
2. Verify Supabase credentials are correct
3. Ensure `pg` package is installed: `npm install pg`
4. Check if backend server is running

### If Data is Missing:
1. Re-run setup: `node database/supabase_setup.js`
2. Check Supabase dashboard for errors
3. Verify network connection

### If Relationships are Broken:
1. Run integrity check queries
2. Look for orphaned records
3. Re-create tables if needed

---

## Quick Commands Cheat Sheet:

```bash
# Full verification
node database/test_data_placement.js

# Quick check
node database/quick_check.js

# Re-run setup (resets database)
node database/supabase_setup.js

# View specific data
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT * FROM users').then(r=>{console.log(r.rows);p.end()});"
```

---

## Automated Daily Check (Optional):

Create a scheduled task to run verification:

**Windows Task Scheduler:**
- Program: `node`
- Arguments: `database/quick_check.js`
- Start in: Your project directory

**Cron (Linux/Mac):**
```bash
0 9 * * * cd /path/to/project && node database/quick_check.js
```

---

## Need More Help?

- View logs in Supabase Dashboard → Logs
- Check backend console output
- Review `DATABASE_SETUP_COMPLETE.md` for detailed info
- Run `node database/test_data_placement.js` for comprehensive report

# DATABASE SETUP INSTRUCTIONS
## Fix Database Connection to Enable Full Testing

### 🔴 Current Issue
Your Supabase database at `db.gfaqgcrjgtkofltyfcbr.supabase.co` is not reachable.

---

## ✅ Solution Options

### OPTION 1: Reactivate/Create New Supabase Project (RECOMMENDED)

**Step 1: Access Supabase**
1. Go to https://supabase.com
2. Login with your account credentials
3. Check if project `gfaqgcrjgtkofltyfcbr` exists
   - If PAUSED → Click "Resume Project"
   - If DELETED → Create a new project

**Step 2: Get New Connection Details**
From your Supabase Dashboard:
1. Click on "Project Settings" (gear icon)
2. Go to "Database" section
3. Copy these values:
   - Host
   - Database name
   - User
   - Password
   - Port

**Step 3: Update Backend Configuration**
Edit file: `backend/config/db.config.js`

Replace lines 22-27 with your new credentials:
```javascript
const pool = new Pool({
    host: process.env.DB_HOST || 'YOUR_NEW_HOST_HERE',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'YOUR_PASSWORD_HERE',
    database: process.env.DB_NAME || 'postgres',
```

**Step 4: Run Database Setup**
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\database"
node supabase_setup.js
```

This will create all 8 tables and insert sample data.

**Step 5: Restart Backend Server**
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\backend"
node server.js
```

---

### OPTION 2: Install Local MySQL Database

**Step 1: Install MySQL**
1. Download: https://dev.mysql.com/downloads/installer/
2. Choose "MySQL Installer for Windows"
3. Run installer and select "Developer Default"
4. Set root password during installation (remember this!)
5. Complete installation

**Step 2: Update Backend to Use MySQL**
Create new file: `backend/config/db.config.mysql.js`
```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'localfinder_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
```

**Step 3: Modify Backend Server**
Edit `backend/server.js` line 4:
```javascript
// Change from:
const db = require('./config/db.config');

// To:
const db = require('./config/db.config.mysql');
```

**Step 4: Run MySQL Setup Script**
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\database"
node setup.js
```

First, edit `setup.js` line 9 with your MySQL password.

**Step 5: Restart Backend**
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\backend"
node server.js
```

---

### OPTION 3: Quick Test with SQLite (Temporary Solution)

This is for quick testing only - not production ready.

**Step 1: Install SQLite**
```powershell
npm install sqlite3
```

**Step 2: Create SQLite Config**
Create `backend/config/db.config.sqlite.js`:
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
    path.join(__dirname, '../../database/localfinder.db'),
    (err) => {
        if (err) {
            console.error('SQLite connection error:', err);
        } else {
            console.log('✅ SQLite database connected');
        }
    }
);

// Wrapper to make it work like PostgreSQL/MySQL
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
        });
    });
};

module.exports = { query };
```

Then modify `backend/server.js` to use this file.

---

## 🧪 After Database is Fixed - Full Testing Steps

### Step 1: Verify Database Connection
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\database"
node quick_check.js
```

Should show:
- ✅ Database connected
- ✅ 8 tables created
- ✅ Sample data inserted

### Step 2: Start Backend Server
```powershell
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Discover your local world\backend"
node server.js
```

Should show:
```
Server is running on port 3000
✅ PostgreSQL database connected successfully!
```

### Step 3: Open Application
Navigate to: http://localhost:3000/index.html

### Step 4: Test Registration (Create New Account)

**Register a new customer:**
1. Click "Register" button in navigation
2. Fill in form:
   - First Name: `Test`
   - Last Name: `Customer`
   - Email: `test.customer@example.com`
   - Phone: `(555) 123-4567`
   - Address: `123 Test Street, Test City, TC 12345`
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`
   - User Type: `Customer`
   - Check "Terms & Conditions"
3. Click "Create Account"
4. **EXPECTED**: Success message, redirect to login
5. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM users WHERE email = 'test.customer@example.com';
   ```
   Should show 1 row with hashed password

**Register a new business owner:**
1. Go to registration page again
2. Fill in form:
   - First Name: `Test`
   - Last Name: `Business`
   - Email: `test.business@example.com`
   - Phone: `(555) 987-6543`
   - Address: `456 Business Ave, Business City, BC 67890`
   - Password: `Business@1234`
   - Confirm Password: `Business@1234`
   - User Type: `Business Owner`
   - Check "Terms & Conditions"
3. Click "Create Account"
4. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM users WHERE email = 'test.business@example.com';
   SELECT * FROM sellers WHERE user_id = (SELECT id FROM users WHERE email = 'test.business@example.com');
   ```
   Should show user record AND seller record

### Step 5: Test Login

**Login with new customer account:**
1. Go to login page
2. Enter:
   - Email: `test.customer@example.com`
   - Password: `Test@1234`
   - Check "Remember me"
3. Click "Login"
4. **EXPECTED**: Redirect to dashboard/home with logged-in state
5. **VERIFY**: JWT token stored in localStorage
6. **VERIFY IN DATABASE**:
   ```sql
   SELECT last_login FROM users WHERE email = 'test.customer@example.com';
   ```
   Should show recent timestamp

**Test failed login:**
1. Try logging in with wrong password
2. **EXPECTED**: Error message "Invalid credentials"
3. **VERIFY**: No token stored

### Step 6: Test Bookings

**Create a booking:**
1. Login as customer
2. Go to "Bookings" page
3. Select a service (e.g., "Plumbing Services")
4. Click "Book Now"
5. Fill booking form:
   - Date: Tomorrow's date
   - Time: 10:00 AM
   - Notes: "Test booking - please confirm"
6. Submit booking
7. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM bookings 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test.customer@example.com')
   ORDER BY created_at DESC LIMIT 1;
   ```
   Should show booking with status 'pending'

### Step 7: Test Messages/Chat

**Send a message:**
1. Login as customer
2. Go to "Messages" page
3. Select a seller conversation
4. Type message: "Hi, I have a question about your services"
5. Click send
6. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM messages 
   WHERE sender_id = (SELECT id FROM users WHERE email = 'test.customer@example.com')
   ORDER BY created_at DESC LIMIT 1;
   ```
   Should show message with is_read = false

### Step 8: Test Favorites

**Add to favorites:**
1. Browse services/sellers
2. Click "♥ Add to Favorites" on a seller
3. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM favorites 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test.customer@example.com');
   ```
   Should show favorite record

**Remove from favorites:**
1. Click "♥ Remove from Favorites"
2. **VERIFY IN DATABASE**: Record should be deleted

### Step 9: Test Reviews

**Submit a review:**
1. Login as customer
2. Find a seller you've booked
3. Click "Write Review"
4. Enter:
   - Rating: 5 stars
   - Comment: "Excellent service! Very professional."
5. Submit review
6. **VERIFY IN DATABASE**:
   ```sql
   SELECT * FROM reviews 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test.customer@example.com');
   ```
   Should show review with rating = 5

### Step 10: Test Profile Updates

**Update user profile:**
1. Login as customer
2. Go to "Profile" page
3. Update:
   - Phone: `(555) 999-8888`
   - Address: `New address`
4. Save changes
5. **VERIFY IN DATABASE**:
   ```sql
   SELECT phone, address, updated_at FROM users 
   WHERE email = 'test.customer@example.com';
   ```
   Should show new phone and address

### Step 11: Test Search Functionality

**Search for services:**
1. On homepage, enter:
   - Service: "plumbing"
   - Location: "downtown"
2. Click "Search"
3. **EXPECTED**: Results showing plumbing services
4. **VERIFY**: SQL query executed:
   ```sql
   SELECT * FROM services s
   JOIN sellers sel ON s.seller_id = sel.id
   WHERE s.name LIKE '%plumbing%' OR s.category LIKE '%plumbing%';
   ```

---

## 📊 Complete Testing Checklist

After database is working, test all these:

### Authentication ✅
- [ ] Register new customer
- [ ] Register new business owner
- [ ] Register new service provider
- [ ] Login with valid credentials
- [ ] Login with invalid password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Logout
- [ ] Remember me functionality

### Bookings ✅
- [ ] Create new booking
- [ ] View booking history
- [ ] Cancel booking
- [ ] Confirm booking (seller side)
- [ ] Complete booking

### Messages/Chat ✅
- [ ] Send message to seller
- [ ] Receive message reply
- [ ] Mark message as read
- [ ] View unread count
- [ ] Delete conversation

### Favorites ✅
- [ ] Add seller to favorites
- [ ] Remove seller from favorites
- [ ] View all favorites
- [ ] Prevent duplicates

### Reviews ✅
- [ ] Submit review for seller
- [ ] Edit existing review
- [ ] View reviews on seller profile
- [ ] Calculate average rating

### Search ✅
- [ ] Search by service name
- [ ] Search by category
- [ ] Search by location
- [ ] Filter results
- [ ] Sort results (rating, price, distance)

### Profile ✅
- [ ] Update personal information
- [ ] Update business information (seller)
- [ ] Change password
- [ ] Upload profile picture (if implemented)

### Notifications ✅
- [ ] Receive booking confirmation notification
- [ ] Receive new message notification
- [ ] Mark notification as read
- [ ] Delete notification

---

## 🎯 Success Criteria

All tests pass when:
1. ✅ Backend connects to database without errors
2. ✅ All 8 tables exist and are queryable
3. ✅ Can create new user via registration form
4. ✅ Can login with created credentials
5. ✅ Can create booking and see it in database
6. ✅ Can send message and see it in database
7. ✅ Can add favorite and see it in database
8. ✅ Can submit review and see it in database
9. ✅ All foreign key constraints work correctly
10. ✅ No SQL errors in backend console

---

## 🚨 Current Status

**DATABASE: ❌ NOT CONNECTED**
- Supabase host unreachable
- Backend running with DISABLE_DB=true
- All database operations will fail

**NEXT STEP: Choose one of the options above to fix database connection**

Recommended: **Option 1 (Supabase)** - Easiest if project still exists  
Alternative: **Option 2 (MySQL)** - Full local control

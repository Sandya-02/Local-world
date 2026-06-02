# Database Setup Guide

This directory contains all the SQL files and scripts needed to set up the LocalFinder database.

## Files

- **schema.sql** - Complete database schema with all table definitions
- **sample_data.sql** - Sample data for testing
- **verify_database.sql** - SQL queries to verify database structure and data
- **setup.js** - Automated Node.js script to create and verify the database

## Prerequisites

1. MySQL Server installed and running
2. MySQL root access or user with database creation privileges
3. Node.js installed (for setup.js script)

## Quick Setup (Automated)

### Step 1: Configure MySQL Credentials

Edit `setup.js` and update the database password on line 9:

```javascript
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD', // Change this
    multipleStatements: true
};
```

### Step 2: Run the Setup Script

```bash
node database/setup.js
```

This will:
- Create the `localfinder_db` database
- Create all 8 tables with proper relationships
- Insert sample data
- Verify the database structure
- Test application queries

## Manual Setup

If you prefer to set up manually:

### Step 1: Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE localfinder_db;
USE localfinder_db;
```

### Step 2: Create Tables

```bash
mysql -u root -p localfinder_db < database/schema.sql
```

### Step 3: Insert Sample Data (Optional)

```bash
mysql -u root -p localfinder_db < database/sample_data.sql
```

### Step 4: Verify Database

```bash
mysql -u root -p localfinder_db < database/verify_database.sql
```

## Database Tables

### Core Tables

1. **users** - User accounts (customers and sellers)
2. **sellers** - Business/seller profiles
3. **services** - Services offered by sellers
4. **bookings** - Customer bookings
5. **reviews** - User reviews and ratings

### Additional Tables

6. **favorites** - User's saved/favorite services
7. **messages** - Chat messages between users
8. **notifications** - User notifications

## Table Relationships

```
users (1) ──→ (∞) sellers
sellers (1) ──→ (∞) services
users (1) ──→ (∞) bookings
services (1) ──→ (∞) bookings
users (1) ──→ (∞) reviews
sellers (1) ──→ (∞) reviews
users (1) ──→ (∞) favorites
sellers (1) ──→ (∞) favorites
users (1) ──→ (∞) messages (as sender)
users (1) ──→ (∞) messages (as receiver)
users (1) ──→ (∞) notifications
```

## Verification Queries

The `verify_database.sql` file contains comprehensive queries to check:

- ✅ All tables are created correctly
- ✅ Foreign key relationships are valid
- ✅ Sample data is inserted properly
- ✅ Indexes are created for performance
- ✅ Application queries work correctly
- ✅ Data integrity is maintained

## Connecting Your Application

After database setup, update your application configuration:

### Update `backend/config/db.config.js`:

```javascript
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'localfinder_db'
});
```

### Update `.env` file:

```env
DISABLE_DB=false
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=localfinder_db
```

## Testing the Database

### Test User Login
- Email: `john@example.com`
- Password: `password123`

### Test Seller Login
- Email: `mike@business.com`
- Password: `password123`

### Sample Data Includes:
- 5 users (2 customers, 3 sellers)
- 3 sellers with businesses
- 9 services across different categories
- 5 bookings with various statuses
- 4 reviews with ratings

## Troubleshooting

### Error: Access Denied
Update the MySQL user and password in `setup.js` or `db.config.js`

### Error: Database Already Exists
The schema.sql file includes `DROP TABLE IF EXISTS` statements, so it's safe to run multiple times.

### Error: Foreign Key Constraint Fails
Ensure tables are created in the correct order (as defined in schema.sql)

### Error: Cannot Connect to MySQL
1. Verify MySQL service is running
2. Check host and port settings
3. Verify user has necessary privileges

## Database Maintenance

### Backup Database
```bash
mysqldump -u root -p localfinder_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p localfinder_db < backup.sql
```

### Clear All Data (Keep Structure)
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE messages;
TRUNCATE TABLE favorites;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE services;
TRUNCATE TABLE sellers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
```

## Next Steps

1. ✅ Run `node database/setup.js` to create the database
2. ✅ Update backend configuration with your MySQL credentials
3. ✅ Set `DISABLE_DB=false` in `.env` file
4. ✅ Restart backend server
5. ✅ Test the application with sample data

## Support

If you encounter issues:
1. Check MySQL error logs
2. Verify all prerequisites are installed
3. Ensure MySQL service is running
4. Review the connection credentials

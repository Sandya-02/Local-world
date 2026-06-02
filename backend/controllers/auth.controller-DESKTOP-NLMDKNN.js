const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
const localAuthStore = require('../utils/local-auth.store');

const JWT_SECRET = 'your-secret-key'; // Change this to a secure secret key

function isDbUnavailable(error) {
    if (!error) return false;
    const transientCodes = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', '57P01'];
    if (transientCodes.includes(error.code)) return true;
    return String(error.message || '').toLowerCase().includes('database disabled');
}

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address, user_type } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        let userData;

        try {
            // PostgreSQL uses $1, $2, etc. instead of ?
            const query = `INSERT INTO users (username, email, password, full_name, phone, address, user_type) 
                          VALUES ($1, $2, $3, $4, $5, $6, $7) 
                          RETURNING id, username, email, full_name, phone, address, user_type, created_at`;

            const result = await db.query(query, [username, email, hashedPassword, full_name, phone, address, user_type || 'user']);
            userData = result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                if (error.constraint === 'users_email_key') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                if (error.constraint === 'users_username_key') {
                    return res.status(400).json({ message: 'Username already exists' });
                }
            }

            if (!isDbUnavailable(error)) {
                throw error;
            }

            const existingByEmail = localAuthStore.findUserByEmail(email);
            if (existingByEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const existingByUsername = localAuthStore.findUserByUsername(username);
            if (existingByUsername) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const localUser = localAuthStore.createUser({
                username,
                email,
                password: hashedPassword,
                full_name,
                phone,
                address,
                user_type: user_type || 'user'
            });

            userData = localAuthStore.toSafeUser(localUser);
        }
        
        res.status(201).json({ 
            message: 'User registered successfully',
            userId: userData.id,
            user: userData
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        let user;

        try {
            // Find user by email - PostgreSQL syntax
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [email]);

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            user = result.rows[0];
        } catch (error) {
            if (!isDbUnavailable(error)) {
                throw error;
            }

            const localUser = localAuthStore.findUserByEmail(email);
            if (!localUser) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            user = localUser;
        }
        
        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                user_type: user.user_type 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        // Update last login in DB if available, otherwise update local fallback store.
        try {
            await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        } catch (error) {
            if (isDbUnavailable(error)) {
                localAuthStore.updateLastLogin(user.id);
            }
        }
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                user_type: user.user_type,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

const JWT_SECRET = 'your-secret-key'; // Change this to a secure secret key

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address, user_type } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `INSERT INTO users (username, email, password, full_name, phone, address, user_type) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(query, [username, email, hashedPassword, full_name, phone, address, user_type], 
            (err, result) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                
                // Return complete user data (excluding password)
                const userData = {
                    id: result.insertId,
                    username,
                    email,
                    full_name,
                    phone,
                    address,
                    user_type
                };
                
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: result.insertId,
                    user: userData
                });
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const query = 'SELECT * FROM users WHERE email = ?';
        
        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            
            const user = results[0];
            
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
            
            // Update last login
            db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
            
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    user_type: user.user_type,
                    full_name: user.full_name
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}; 
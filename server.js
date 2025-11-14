require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'localfinder_db'
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, user_type } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = 'INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hashedPassword, user_type], (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seller Registration
app.post('/api/register/seller', async (req, res) => {
    try {
        const { user_id, business_name, business_type, description } = req.body;
        
        const query = 'INSERT INTO sellers (user_id, business_name, business_type, description) VALUES (?, ?, ?, ?)';
        db.query(query, [user_id, business_name, business_type, description], (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: 'Seller registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Seller Details
app.get('/api/seller/:sellerId', (req, res) => {
    const sellerId = req.params.sellerId;
    const query = `
        SELECT s.*, u.email, u.phone_number,
            (SELECT AVG(rating) FROM reviews WHERE seller_id = s.seller_id) as average_rating,
            (SELECT COUNT(*) FROM reviews WHERE seller_id = s.seller_id) as review_count
        FROM sellers s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.seller_id = ?
    `;
    
    db.query(query, [sellerId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// Get User Details
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.phone_number, u.address,
            (SELECT COUNT(*) FROM bookings WHERE user_id = u.user_id) as booking_count
        FROM users u
        WHERE u.user_id = ?
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// Add Service
app.post('/api/services', (req, res) => {
    const { seller_id, service_name, category, description, price_range } = req.body;
    const query = 'INSERT INTO services (seller_id, service_name, category, description, price_range) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [seller_id, service_name, category, description, price_range], (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Service added successfully' });
    });
});

// Add Review
app.post('/api/reviews', (req, res) => {
    const { user_id, seller_id, rating, comment } = req.body;
    const query = 'INSERT INTO reviews (user_id, seller_id, rating, comment) VALUES (?, ?, ?, ?)';
    
    db.query(query, [user_id, seller_id, rating, comment], (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Review added successfully' });
    });
});

// Create Booking
app.post('/api/bookings', (req, res) => {
    const { user_id, service_id, booking_date, booking_time } = req.body;
    const query = 'INSERT INTO bookings (user_id, service_id, booking_date, booking_time) VALUES (?, ?, ?, ?)';
    
    db.query(query, [user_id, service_id, booking_date, booking_time], (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Booking created successfully' });
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: req.body.message
                }],
                max_tokens: 150
            })
        });

        const data = await response.json();
        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
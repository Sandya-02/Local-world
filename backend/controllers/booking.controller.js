const db = require('../config/db.config');

exports.createBooking = (req, res) => {
    const { user_id, service_id, booking_date, booking_time } = req.body;
    
    const query = `INSERT INTO bookings (user_id, service_id, booking_date, booking_time) 
                  VALUES (?, ?, ?, ?)`;
    
    db.query(query, [user_id, service_id, booking_date, booking_time], (err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(201).json({ message: 'Booking created successfully' });
    });
};

exports.getUserBookings = (req, res) => {
    const userId = req.params.userId;
    
    const query = `
        SELECT b.*, s.name as service_name, sl.business_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN sellers sl ON s.seller_id = sl.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(results);
    });
}; 
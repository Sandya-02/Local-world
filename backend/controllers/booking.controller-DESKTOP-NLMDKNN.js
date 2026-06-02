const db = require('../config/db.config');

exports.createBooking = async (req, res) => {
    try {
        const { user_id, service_id, booking_date, booking_time } = req.body;
        
        // Validate required fields
        if (!user_id || !service_id || !booking_date || !booking_time) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // PostgreSQL syntax
        const query = `INSERT INTO bookings (user_id, service_id, booking_date, booking_time) 
                      VALUES ($1, $2, $3, $4)
                      RETURNING *`;
        
        const result = await db.query(query, [user_id, service_id, booking_date, booking_time]);
        
        res.status(201).json({ 
            message: 'Booking created successfully',
            booking: result.rows[0]
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // PostgreSQL syntax
        const query = `
            SELECT b.*, s.name as service_name, sl.business_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN sellers sl ON s.seller_id = sl.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC
        `;
        
        const result = await db.query(query, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: error.message });
    }
}; 
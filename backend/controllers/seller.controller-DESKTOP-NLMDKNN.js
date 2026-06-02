const db = require('../config/db.config');

exports.registerSeller = async (req, res) => {
    try {
        const { user_id, business_name, business_type, description, address, phone, email, website, operating_hours } = req.body;
        
        // Validate required fields
        if (!user_id || !business_name) {
            return res.status(400).json({ message: 'User ID and business name are required' });
        }
        
        // PostgreSQL syntax with $1, $2, etc.
        const query = `INSERT INTO sellers 
                      (user_id, business_name, business_type, description, address, phone, email, website, operating_hours) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                      RETURNING *`;
        
        const result = await db.query(query, 
            [user_id, business_name, business_type, description, address, phone, email, website, operating_hours]
        );
        
        res.status(201).json({ 
            message: 'Seller registered successfully',
            seller: result.rows[0]
        });
    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({ message: error.message || 'Failed to register seller' });
    }
};

exports.getSellerDetails = async (req, res) => {
    try {
        const sellerId = req.params.id;
        
        // PostgreSQL syntax
        const query = `
            SELECT s.*, u.email, u.phone,
                (SELECT AVG(rating)::numeric(10,2) FROM reviews WHERE seller_id = s.id) as average_rating,
                (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
            FROM sellers s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `;
        
        const result = await db.query(query, [sellerId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get seller details error:', error);
        res.status(500).json({ message: error.message });
    }
}; 
const db = require('../config/db.config');

exports.registerSeller = async (req, res) => {
    try {
        const { user_id, business_name, business_type, description, address, phone, email, website, operating_hours } = req.body;
        
        const query = `INSERT INTO sellers 
                      (user_id, business_name, business_type, description, address, phone, email, website, operating_hours) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(query, 
            [user_id, business_name, business_type, description, address, phone, email, website, operating_hours],
            (err, result) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                res.status(201).json({ message: 'Seller registered successfully' });
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSellerDetails = (req, res) => {
    const sellerId = req.params.id;
    
    const query = `
        SELECT s.*, u.email, u.phone,
            (SELECT AVG(rating) FROM reviews WHERE seller_id = s.id) as average_rating,
            (SELECT COUNT(*) FROM reviews WHERE seller_id = s.id) as review_count
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    `;
    
    db.query(query, [sellerId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.json(results[0]);
    });
}; 
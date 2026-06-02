const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const authMiddleware = require('../middleware/auth.middleware');
const localAuthStore = require('../utils/local-auth.store');

function isDbUnavailable(error) {
  if (!error) return false;
  const transientCodes = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', '57P01'];
  if (transientCodes.includes(error.code)) return true;
  return String(error.message || '').toLowerCase().includes('database disabled');
}

// GET /api/users/me - Get current logged-in user
router.get('/me', authMiddleware, async (req, res) => {
  const currentUserId = req.userData && req.userData.id;
  if (!currentUserId) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  try {
    const query = 'SELECT id, username, email, full_name, phone, address, user_type, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [currentUserId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    if (isDbUnavailable(error)) {
      const localUser = localAuthStore.findUserById(currentUserId);
      if (!localUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(localAuthStore.toSafeUser(localUser));
    }

    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT id, username, email, full_name, phone, address, user_type, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, phone, address } = req.body;
    
    const query = `
      UPDATE users 
      SET full_name = $1, email = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, email, full_name, phone, address, user_type, created_at, updated_at
    `;
    
    const result = await db.query(query, [full_name, email, phone, address, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/ (optional list)
router.get('/', (req, res) => {
  res.json({ message: 'users route placeholder' });
});

module.exports = router;

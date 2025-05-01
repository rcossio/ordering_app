const express = require('express');
const router = express.Router();
const { User } = require('./models'); // Import User model

// Endpoint to fetch a user by username
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

module.exports = router;
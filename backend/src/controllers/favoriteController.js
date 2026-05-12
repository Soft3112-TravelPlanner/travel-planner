const db = require('../config/db');

const getFavorites = async (req, res) => {
  const userId = req.user.id;
  try {
    const [favorites] = await db.query(
      'SELECT destination_id FROM favorites WHERE user_id = ?',
      [userId]
    );
    res.json(favorites.map(f => f.destination_id));
  } catch (e) {
    console.error('getFavorites error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const { destinationId } = req.params;

  try {
    // Check if already exists
    const [existing] = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? AND destination_id = ?',
      [userId, destinationId]
    );

    if (existing.length > 0) {
      // Remove
      await db.query(
        'DELETE FROM favorites WHERE user_id = ? AND destination_id = ?',
        [userId, destinationId]
      );
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // Add
      await db.query(
        'INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)',
        [userId, destinationId]
      );
      res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (e) {
    console.error('toggleFavorite error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getFavorites,
  toggleFavorite,
};

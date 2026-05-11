const db = require('../config/db');

/* ---------- CREATE ---------- */
const addRestaurant = async (req, res) => {
  const { destination_id, name, cuisine, lat, lng } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO restaurants 
        (destination_id, name, cuisine, lat, lng) 
       VALUES (?, ?, ?, ?, ?)`,
      [destination_id, name, cuisine || null, lat || null, lng || null]
    );
    const [newRest] = await db.query('SELECT * FROM restaurants WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json(newRest[0]);
  } catch (e) {
    console.error('addRestaurant error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- READ ---------- */
const getRestaurantsByDestination = async (req, res) => {
  const { destinationId } = req.params;
  try {
    const [restaurants] = await db.query(
      'SELECT * FROM restaurants WHERE destination_id = ?',
      [destinationId]
    );
    res.json(restaurants);
  } catch (e) {
    console.error('getRestaurantsByDestination error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- UPDATE ---------- */
const updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const { name, cuisine, lat, lng } = req.body;

  try {
    await db.query(
      `UPDATE restaurants SET 
         name = ?, cuisine = ?, lat = ?, lng = ?
       WHERE id = ?`,
      [name, cuisine, lat, lng, id]
    );
    const [rest] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    res.json(rest[0]);
  } catch (e) {
    console.error('updateRestaurant error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- DELETE ---------- */
const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM restaurants WHERE id = ?', [id]);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (e) {
    console.error('deleteRestaurant error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addRestaurant,
  getRestaurantsByDestination,
  updateRestaurant,
  deleteRestaurant,
};

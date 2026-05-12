const db = require('../config/db');

/* ---------- CREATE ---------- */
const addTrip = async (req, res) => {
  const { name, destinationId, startDate, endDate, accommodation, transport, checklist, plannedActivities } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      `INSERT INTO trips 
        (user_id, name, destination_id, start_date, end_date, accommodation, transport, checklist, planned_activities) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        name, 
        destinationId, 
        startDate, 
        endDate, 
        JSON.stringify(accommodation || null), 
        JSON.stringify(transport || null), 
        JSON.stringify(checklist || []), 
        JSON.stringify(plannedActivities || [])
      ]
    );
    
    const [newTrip] = await db.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);
    res.status(201).json(newTrip[0]);
  } catch (e) {
    console.error('addTrip error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- READ ---------- */
const getTrips = async (req, res) => {
  const userId = req.user.id;
  try {
    const [trips] = await db.query('SELECT * FROM trips WHERE user_id = ? ORDER BY start_date ASC', [userId]);
    res.json(trips);
  } catch (e) {
    console.error('getTrips error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- UPDATE ---------- */
const updateTrip = async (req, res) => {
  const { id } = req.params;
  const { name, destinationId, startDate, endDate, accommodation, transport, checklist, plannedActivities } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `UPDATE trips SET 
         name = ?, destination_id = ?, start_date = ?, end_date = ?, 
         accommodation = ?, transport = ?, checklist = ?, planned_activities = ?
       WHERE id = ? AND user_id = ?`,
      [
        name, 
        destinationId, 
        startDate, 
        endDate, 
        JSON.stringify(accommodation || null), 
        JSON.stringify(transport || null), 
        JSON.stringify(checklist || []), 
        JSON.stringify(plannedActivities || []),
        id,
        userId
      ]
    );
    const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
    res.json(trip[0]);
  } catch (e) {
    console.error('updateTrip error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- DELETE ---------- */
const deleteTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await db.query('DELETE FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (e) {
    console.error('deleteTrip error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addTrip,
  getTrips,
  updateTrip,
  deleteTrip,
};

const db = require('../config/db');

/* ---------- CREATE ---------- */
const addDestination = async (req, res) => {
  const { name, description, city, country, lat, lng, estimated_cost, rating, localRestaurants } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [result] = await connection.query(
      `INSERT INTO destinations 
        (name, description, city, country, lat, lng, estimated_cost, rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, city || null, country || null, lat || null, lng || null, estimated_cost || 0, rating || 0]
    );
    
    const destinationId = result.insertId;

    if (localRestaurants && Array.isArray(localRestaurants)) {
      for (const rest of localRestaurants) {
        await connection.query(
          `INSERT INTO restaurants (destination_id, name, cuisine, lat, lng) VALUES (?, ?, ?, ?, ?)`,
          [destinationId, rest.name, rest.cuisine || null, rest.coordinates?.lat || null, rest.coordinates?.lng || null]
        );
      }
    }

    await connection.commit();

    const [newDest] = await db.query('SELECT * FROM destinations WHERE id = ?', [destinationId]);
    const [rests] = await db.query('SELECT * FROM restaurants WHERE destination_id = ?', [destinationId]);
    
    res.status(201).json({ ...newDest[0], localRestaurants: rests });
  } catch (e) {
    await connection.rollback();
    console.error('addDestination error:', e);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

/* ---------- READ ---------- */
const getDestinations = async (req, res) => {
  try {
    const [destinations] = await db.query('SELECT * FROM destinations ORDER BY created_at DESC');
    
    // Fetch restaurants and landmarks for each destination
    const destinationsWithRestaurants = await Promise.all(destinations.map(async (dest) => {
      const [rests] = await db.query('SELECT * FROM restaurants WHERE destination_id = ?', [dest.id]);
      const [marks] = await db.query('SELECT * FROM landmarks WHERE destination_id = ?', [dest.id]);
      
      // Map DB fields to Frontend Interface
      return {
        id: dest.id,
        name: dest.name,
        city: dest.city,
        country: dest.country,
        description: dest.description,
        mainImageUrl: dest.main_image_url || `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop`, // Fallback
        coordinates: {
          lat: parseFloat(dest.lat) || 0,
          lng: parseFloat(dest.lng) || 0
        },
        landmarks: marks.map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          coordinates: { lat: parseFloat(m.lat) || 0, lng: parseFloat(m.lng) || 0 }
        })),
        localRestaurants: rests.map(r => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          coordinates: { lat: parseFloat(r.lat) || 0, lng: parseFloat(r.lng) || 0 }
        })),
        averageRating: parseFloat(dest.rating) || 4.5,
        estimatedBudget: parseFloat(dest.estimated_cost) || 0,
        moods: dest.moods ? (typeof dest.moods === 'string' ? JSON.parse(dest.moods) : dest.moods) : ["Cultural", "History"]
      };
    }));

    res.json(destinationsWithRestaurants);
  } catch (e) {
    console.error('getDestinations error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------- UPDATE ---------- */
const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { name, description, city, country, lat, lng, estimated_cost, rating, localRestaurants } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      `UPDATE destinations SET 
         name = ?, description = ?, city = ?, country = ?, lat = ?, lng = ?, estimated_cost = ?, rating = ?
       WHERE id = ?`,
      [name, description, city, country, lat, lng, estimated_cost, rating, id]
    );

    // Simplistic approach: delete existing restaurants and re-insert
    await connection.query('DELETE FROM restaurants WHERE destination_id = ?', [id]);

    if (localRestaurants && Array.isArray(localRestaurants)) {
      for (const rest of localRestaurants) {
        await connection.query(
          `INSERT INTO restaurants (destination_id, name, cuisine, lat, lng) VALUES (?, ?, ?, ?, ?)`,
          [id, rest.name, rest.cuisine || null, rest.coordinates?.lat || null, rest.coordinates?.lng || null]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Destination updated successfully' });
  } catch (e) {
    await connection.rollback();
    console.error('updateDestination error:', e);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

/* ---------- DELETE ---------- */
const deleteDestination = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM destinations WHERE id = ?', [id]);
    res.json({ message: 'Destination deleted successfully' });
  } catch (e) {
    console.error('deleteDestination error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  addDestination,
  getDestinations,
  updateDestination,
  deleteDestination,
};

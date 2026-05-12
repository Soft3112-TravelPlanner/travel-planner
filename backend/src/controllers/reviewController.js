const db = require('../config/db');

// GET /api/reviews/destination/:destinationId
const getDestinationReviews = async (req, res) => {
    const { destinationId } = req.params;
    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.email as userName 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.destination_id = ? 
             ORDER BY r.created_at DESC`,
            [destinationId]
        );
        
        // Map snake_case to camelCase and parse photos
        const mapped = reviews.map(r => ({
            id: r.id,
            userId: r.user_id,
            tripId: r.trip_id,
            destinationId: r.destination_id,
            rating: r.rating,
            text: r.text,
            photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : (r.photos || []),
            timestamp: r.created_at,
            userName: r.userName
        }));

        res.json(mapped);
    } catch (error) {
        console.error('getDestinationReviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/reviews/all (Admin only)
const getAllReviews = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.email as userName 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             ORDER BY r.created_at DESC`
        );

        const mapped = reviews.map(r => ({
            id: r.id,
            userId: r.user_id,
            tripId: r.trip_id,
            destinationId: r.destination_id,
            rating: r.rating,
            text: r.text,
            photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : (r.photos || []),
            timestamp: r.created_at,
            userName: r.userName
        }));

        res.json(mapped);
    } catch (error) {
        console.error('getAllReviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/reviews/my
const getUserReviews = async (req, res) => {
    const userId = req.user.id;
    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.email as userName 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.user_id = ? 
             ORDER BY r.created_at DESC`,
            [userId]
        );

        const mapped = reviews.map(r => ({
            id: r.id,
            userId: r.user_id,
            tripId: r.trip_id,
            destinationId: r.destination_id,
            rating: r.rating,
            text: r.text,
            photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : (r.photos || []),
            timestamp: r.created_at,
            userName: r.userName
        }));

        res.json(mapped);
    } catch (error) {
        console.error('getUserReviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/reviews
const addReview = async (req, res) => {
    const { tripId, destinationId, rating, text, photos } = req.body;
    const userId = req.user.id;

    if (!destinationId || !rating) {
        return res.status(400).json({ message: 'Destination and rating are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO reviews (user_id, trip_id, destination_id, rating, text, photos) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, tripId || null, destinationId, rating, text || '', JSON.stringify(photos || [])]
        );

        const [newReview] = await db.query(
            `SELECT r.*, u.email as userName 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.id = ?`, 
            [result.insertId]
        );

        const r = newReview[0];
        res.status(201).json({
            id: r.id,
            userId: r.user_id,
            tripId: r.trip_id,
            destinationId: r.destination_id,
            rating: r.rating,
            text: r.text,
            photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : (r.photos || []),
            timestamp: r.created_at,
            userName: r.userName
        });
    } catch (error) {
        console.error('addReview error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin'; // Assume role is in token

    try {
        // If not admin, check ownership
        let query = 'DELETE FROM reviews WHERE id = ?';
        let params = [id];

        if (!isAdmin) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('deleteReview error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getDestinationReviews,
    getAllReviews,
    getUserReviews,
    addReview,
    deleteReview
};

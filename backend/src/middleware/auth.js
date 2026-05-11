const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Authorization denied, invalid token' });
    }

    try {
        // 1. Verify token signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Check if token is in blacklist
        const [blacklist] = await db.query('SELECT * FROM token_blacklist WHERE token = ?', [token]);
        if (blacklist.length > 0) {
            return res.status(401).json({ message: 'Token is no longer valid' });
        }

        // 3. Get user and check token_version
        const [users] = await db.query('SELECT id, email, role, token_version FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        const user = users[0];
        if (user.token_version !== decoded.token_version) {
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }

        // Attach user to request
        req.user = user;
        req.token = token; // Store token for logout
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;

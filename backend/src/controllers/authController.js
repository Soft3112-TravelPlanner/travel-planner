const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (id, tokenVersion, rememberMe) => {
    return jwt.sign(
        { id, token_version: tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? '30d' : '7d' }
    );
};

exports.register = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    try {
        // 1. Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: existingUsers[0].email === email
                    ? 'Bu e-posta adresi zaten kullanımda'
                    : 'Bu kullanıcı adı zaten alınmış'
            });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create user
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, username, email, passwordHash]
        );

        const userId = result.insertId;

        // 4. Generate token
        const token = generateToken(userId, 0, false);

        res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                username,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Kayıt işlemi sırasında bir hata oluştu' });
    }
};


exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        // 1. Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
        }

        const user = users[0];

        // 2. Check if account is locked
        if (user.lock_until && new Date() < new Date(user.lock_until)) {
            return res.status(403).json({ message: 'Hesabınız çok fazla hatalı deneme nedeniyle geçici olarak kilitlenmiştir. Lütfen 15 dakika sonra tekrar deneyin.' });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // Update failed attempts
            const newAttempts = user.failed_attempts + 1;
            let lockUntil = null;

            if (newAttempts >= 5) {
                lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
            }

            await db.query('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE id = ?', [newAttempts, lockUntil, user.id]);

            return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
        }

        // 4. Reset failed attempts on success
        await db.query('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?', [user.id]);

        // 5. Generate token
        const token = generateToken(user.id, user.token_version, rememberMe);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.token;
        await db.query('INSERT INTO token_blacklist (token) VALUES (?)', [token]);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // 1. Get user (with full hash)
        const [users] = await db.query('SELECT password_hash, token_version FROM users WHERE id = ?', [userId]);
        const user = users[0];

        // 2. Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mevcut şifre hatalı' });
        }

        // 3. Ensure new password is different
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'Yeni şifre mevcut şifre ile aynı olamaz' });
        }

        // 4. Hash new password
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        // 5. Update password and increment token_version (invalidates all old tokens)
        const newTokenVersion = user.token_version + 1;
        await db.query('UPDATE users SET password_hash = ?, token_version = ? WHERE id = ?', [newHash, newTokenVersion, userId]);

        res.status(200).json({ message: 'Şifre başarıyla güncellendi. Lütfen tekrar giriş yapın.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Şifre değiştirme işlemi başarısız oldu' });
    }
};

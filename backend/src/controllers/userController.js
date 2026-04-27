const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, first_name, last_name, username, email, preferences, avatar, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const user = users[0];
        res.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                email: user.email,
                preferences: user.preferences,
                avatar: user.avatar,
                role: user.role,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Profil bilgileri alınırken bir hata oluştu' });
    }
};

exports.updateProfile = async (req, res) => {
    const { firstName, lastName, preferences } = req.body;
    const userId = req.user.id;

    try {
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, preferences = ? WHERE id = ?',
            [firstName, lastName, preferences, userId]
        );

        res.json({ message: 'Profil başarıyla güncellendi' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
    }
};

exports.uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Lütfen bir dosya seçin' });
    }

    const userId = req.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    try {
        // 1. Get old avatar to delete it later if needed
        const [users] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
        const oldAvatar = users[0]?.avatar;

        // 2. Update database
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);

        // 3. Delete old avatar file if it exists and is not default
        if (oldAvatar && !oldAvatar.includes('default')) {
            const oldFilePath = path.join(__dirname, '../../', oldAvatar);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        res.json({
            message: 'Profil fotoğrafı güncellendi',
            avatar: avatarPath
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Profil fotoğrafı yüklenirken bir hata oluştu' });
    }
};

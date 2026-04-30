const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;

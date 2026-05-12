const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.get('/', auth, favoriteController.getFavorites);
router.post('/toggle/:destinationId', auth, favoriteController.toggleFavorite);

module.exports = router;

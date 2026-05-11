const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Public: Get reviews for a destination
router.get('/destination/:destinationId', reviewController.getDestinationReviews);

// Protected: Get ALL reviews (Admin)
router.get('/all', auth, reviewController.getAllReviews);

// Protected: Get user's own reviews
router.get('/my', auth, reviewController.getUserReviews);

// Protected: Post a review
router.post('/', auth, reviewController.addReview);

// Protected: Delete a review (Admin or Owner)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;

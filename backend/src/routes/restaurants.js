const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/restaurantController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', ctrl.addRestaurant);
router.get('/destination/:destinationId', ctrl.getRestaurantsByDestination);
router.put('/:id', ctrl.updateRestaurant);
router.delete('/:id', ctrl.deleteRestaurant);

module.exports = router;

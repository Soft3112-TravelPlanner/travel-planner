const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tripController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', ctrl.addTrip);
router.get('/', ctrl.getTrips);
router.put('/:id', ctrl.updateTrip);
router.delete('/:id', ctrl.deleteTrip);

module.exports = router;

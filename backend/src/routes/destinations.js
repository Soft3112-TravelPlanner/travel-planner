const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/destinationController');
const auth = require('../middleware/auth');

router.get('/', ctrl.getDestinations);
router.post('/', auth, ctrl.addDestination);
router.put('/:id', auth, ctrl.updateDestination);
router.delete('/:id', auth, ctrl.deleteDestination);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/destinationController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', ctrl.addDestination);
router.get('/', ctrl.getDestinations);
router.put('/:id', ctrl.updateDestination);
router.delete('/:id', ctrl.deleteDestination);

module.exports = router;

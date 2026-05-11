const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
const receiptUpload = require('../middleware/receiptUpload');

router.use(authMiddleware);

router.post('/', receiptUpload.single('receipt_photo'), expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;

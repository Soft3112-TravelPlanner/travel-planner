const db = require('../config/db');

// POST /api/expenses
const addExpense = async (req, res) => {
    const { title, amount, category, date, trip_id } = req.body;
    const userId = req.user.id;
    const receipt_photo = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    if (!title || !amount) {
        return res.status(400).json({ message: 'Title and amount are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO expenses (user_id, trip_id, title, amount, category, date, receipt_photo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, trip_id || null, title, amount, category, date, receipt_photo]
        );

        const [newExpense] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
        res.status(201).json(newExpense[0]);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/expenses
const getExpenses = async (req, res) => {
    const userId = req.user.id;

    try {
        const [expenses] = await db.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC', [userId]);

        // Calculate total sum
        const totalSum = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        // Calculate category breakdown
        const categoryBreakdown = expenses.reduce((acc, exp) => {
            const cat = exp.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount);
            return acc;
        }, {});

        res.json({
            expenses,
            totalSum,
            categoryBreakdown
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [result] = await db.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense
};

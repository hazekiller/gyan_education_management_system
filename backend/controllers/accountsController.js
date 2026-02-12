const db = require('../config/database');

// Get Accounts Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // 1. Total Income (Fees) - This Month
        const [feeIncome] = await db.query(
            `SELECT SUM(amount_paid) as total FROM fee_payments 
             WHERE MONTH(payment_date) = ? AND YEAR(payment_date) = ? AND status = 'completed'`,
            [currentMonth, currentYear]
        );

        // 2. Total Expenses (General Expenses + Payroll) - This Month
        const [generalExpenses] = await db.query(
            `SELECT SUM(amount) as total FROM expenses 
             WHERE MONTH(expense_date) = ? AND YEAR(expense_date) = ?`,
            [currentMonth, currentYear]
        );

        const [payrollExpenses] = await db.query(
            `SELECT SUM(net_salary) as total FROM payroll 
             WHERE month = ? AND year = ? AND status = 'paid'`,
            [new Date().toLocaleString('default', { month: 'long' }), currentYear]
        );

        const totalIncome = parseFloat(feeIncome[0].total || 0);
        const totalExpense = parseFloat(generalExpenses[0].total || 0) + parseFloat(payrollExpenses[0].total || 0);

        // 3. Recent Transactions (Income + Expenses mixed or separate)
        // For simplicity, let's return them separately or just expense for now
        const [recentExpenses] = await db.query(
            `SELECT * FROM expenses ORDER BY expense_date DESC LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                income: totalIncome,
                expense: totalExpense,
                netProfit: totalIncome - totalExpense,
                recentExpenses
            }
        });
    } catch (error) {
        console.error('Error fetching account stats:', error);
        res.status(500).json({ message: 'Error fetching account stats' });
    }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
    try {
        const [expenses] = await db.query(`SELECT * FROM expenses ORDER BY expense_date DESC`);
        res.json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses' });
    }
};

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { title, description, amount, expense_date, expense_head, payment_method, reference_no } = req.body;

        await db.query(
            `INSERT INTO expenses (title, description, amount, expense_date, expense_head, payment_method, reference_no, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, amount, expense_date || new Date(), expense_head, payment_method, reference_no, req.user.id]
        );

        res.status(201).json({ success: true, message: 'Expense added successfully' });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Error adding expense' });
    }
};

// Update Tally Reference
exports.updateTallyReference = async (req, res) => {
    try {
        const { id } = req.params;
        const { reference_no } = req.body;
        // Check if it's expense or income (fee). For now assumes expense if route usage logic is kept simple
        // Or we can have `type` param.
        // Let's support updating expense reference for now.

        await db.query('UPDATE expenses SET reference_no = ? WHERE id = ?', [reference_no, id]);
        res.json({ success: true, message: 'Reference updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reference' });
    }
};

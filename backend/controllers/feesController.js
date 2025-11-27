const db = require("../config/database");

// ===== Fee Heads =====

exports.createFeeHead = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Fee head name is required" });

        const [result] = await db.query(
            "INSERT INTO fee_heads (name, description) VALUES (?, ?)",
            [name, description]
        );

        res.status(201).json({ message: "Fee head created", id: result.insertId });
    } catch (error) {
        console.error("Error creating fee head:", error);
        res.status(500).json({ message: "Error creating fee head", error: error.message });
    }
};

exports.getFeeHeads = async (req, res) => {
    try {
        const [heads] = await db.query("SELECT * FROM fee_heads WHERE is_active = true");
        res.status(200).json(heads);
    } catch (error) {
        console.error("Error fetching fee heads:", error);
        res.status(500).json({ message: "Error fetching fee heads", error: error.message });
    }
};

// ===== Fee Structure =====

exports.createFeeStructure = async (req, res) => {
    try {
        const { class_id, fee_head_id, amount, academic_year, period_type, period_value, due_date, description } = req.body;

        // Validation
        if (!class_id || !fee_head_id || !amount || !academic_year) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [result] = await db.query(
            `INSERT INTO fee_structure 
      (class_id, fee_head_id, amount, academic_year, period_type, period_value, due_date, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [class_id, fee_head_id, amount, academic_year, period_type, period_value, due_date, description]
        );

        res.status(201).json({ message: "Fee structure added", id: result.insertId });
    } catch (error) {
        console.error("Error adding fee structure:", error);
        res.status(500).json({ message: "Error adding fee structure", error: error.message });
    }
};

exports.getFeeStructure = async (req, res) => {
    try {
        const { class_id, academic_year } = req.query;
        let query = `
      SELECT fs.*, fh.name as fee_head_name, c.name as class_name 
      FROM fee_structure fs
      JOIN fee_heads fh ON fs.fee_head_id = fh.id
      JOIN classes c ON fs.class_id = c.id
      WHERE fs.is_active = true
    `;
        const params = [];

        if (class_id) {
            query += " AND fs.class_id = ?";
            params.push(class_id);
        }
        if (academic_year) {
            query += " AND fs.academic_year = ?";
            params.push(academic_year);
        }

        query += " ORDER BY fs.created_at DESC";

        const [structures] = await db.query(query, params);
        res.status(200).json(structures);
    } catch (error) {
        console.error("Error fetching fee structure:", error);
        res.status(500).json({ message: "Error fetching fee structure", error: error.message });
    }
};

// ===== Fee Collection / Student Dues =====

// Get fee status for a student
exports.getStudentFeeStatus = async (req, res) => {
    try {
        const { student_id } = req.params;

        // 1. Get student details to know class
        let studentQuery = "SELECT id, class_id FROM students WHERE ";
        let studentParam;

        // Check if student_id is numeric (ID) or string (Admission Number)
        // We assume admission numbers are strings like 'ADM...' and IDs are numeric strings
        if (/^\d+$/.test(student_id)) {
            studentQuery += "id = ?";
            studentParam = student_id;
        } else {
            studentQuery += "admission_number = ?";
            studentParam = student_id;
        }

        const [students] = await db.query(studentQuery, [studentParam]);

        if (students.length === 0) return res.status(404).json({ message: "Student not found" });
        const { class_id, id: actual_student_id } = students[0];

        // 2. Get all applicable fees for this class
        const [fees] = await db.query(`
      SELECT fs.*, fh.name as fee_head_name 
      FROM fee_structure fs
      JOIN fee_heads fh ON fs.fee_head_id = fh.id
      WHERE fs.class_id = ? AND fs.is_active = true
    `, [class_id]);

        // 3. Get all payments made by student
        const [payments] = await db.query(`
      SELECT * FROM fee_payments WHERE student_id = ? AND status = 'completed'
    `, [actual_student_id]);

        // 4. Calculate dues
        const feeStatus = fees.map(fee => {
            const paid = payments
                .filter(p => p.fee_structure_id === fee.id)
                .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

            return {
                ...fee,
                paid_amount: paid,
                balance: parseFloat(fee.amount) - paid,
                status: paid >= parseFloat(fee.amount) ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid')
            };
        });

        res.status(200).json(feeStatus);
    } catch (error) {
        console.error("Error fetching student fee status:", error);
        res.status(500).json({ message: "Error fetching student fee status", error: error.message });
    }
};

exports.collectFee = async (req, res) => {
    try {
        const { student_id, fee_structure_id, amount_paid, payment_method, remarks } = req.body;

        // Validation
        if (!student_id || !fee_structure_id || !amount_paid || !payment_method) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [result] = await db.query(`
            INSERT INTO fee_payments (student_id, fee_structure_id, amount_paid, payment_date, payment_method, remarks, collected_by)
            VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
        `, [student_id, fee_structure_id, amount_paid, payment_method, remarks, req.user ? req.user.id : null]);

        res.status(201).json({ message: "Payment recorded", id: result.insertId });
    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({ message: "Error recording payment", error: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { start_date, end_date, student_id } = req.query;
        let query = `
      SELECT fp.*, s.first_name, s.last_name, s.admission_number, fh.name as fee_head_name
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.id
      JOIN fee_structure fs ON fp.fee_structure_id = fs.id
      JOIN fee_heads fh ON fs.fee_head_id = fh.id
    `;
        const params = [];
        const conditions = [];

        if (start_date) {
            conditions.push("fp.payment_date >= ?");
            params.push(start_date);
        }
        if (end_date) {
            conditions.push("fp.payment_date <= ?");
            params.push(end_date);
        }
        if (student_id) {
            conditions.push("fp.student_id = ?");
            params.push(student_id);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY fp.payment_date DESC";

        const [payments] = await db.query(query, params);

        // Format for frontend
        const formatted = payments.map(p => ({
            ...p,
            student_name: `${p.first_name} ${p.last_name}`,
            fee_type: p.fee_head_name // Map for existing frontend compatibility
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
};

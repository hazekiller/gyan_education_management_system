const db = require("../config/database");

// Get all payroll records with filters
exports.getAllPayrollRecords = async (req, res) => {
    try {
        const { month, year, employee_type, status } = req.query;
        let query = `
      SELECT p.*, 
             CASE 
               WHEN p.employee_type = 'teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
               WHEN p.employee_type = 'staff' THEN CONCAT(s.first_name, ' ', s.last_name)
             END as employee_name,
             CASE 
               WHEN p.employee_type = 'teacher' THEN t.employee_id
               WHEN p.employee_type = 'staff' THEN s.employee_id
             END as employee_code
      FROM payroll p
      LEFT JOIN teachers t ON p.employee_type = 'teacher' AND p.employee_id = t.id
      LEFT JOIN staff s ON p.employee_type = 'staff' AND p.employee_id = s.id
      WHERE 1=1
    `;
        const params = [];

        if (month) {
            query += " AND p.month = ?";
            params.push(month);
        }
        if (year) {
            query += " AND p.year = ?";
            params.push(year);
        }
        if (employee_type) {
            query += " AND p.employee_type = ?";
            params.push(employee_type);
        }
        if (status) {
            query += " AND p.status = ?";
            params.push(status);
        }

        query += " ORDER BY p.created_at DESC";

        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching payroll records:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get payroll record by ID
exports.getPayrollById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM payroll WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Payroll record not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching payroll record:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create new payroll record
exports.createPayrollRecord = async (req, res) => {
    try {
        const {
            employee_type,
            employee_id,
            month,
            year,
            basic_salary,
            allowances,
            deductions,
            payment_method,
            remarks,
            status,
        } = req.body;

        // Calculate net salary
        const net_salary =
            parseFloat(basic_salary) +
            parseFloat(allowances || 0) -
            parseFloat(deductions || 0);

        const query = `
      INSERT INTO payroll (
        employee_type, employee_id, month, year, basic_salary, 
        allowances, deductions, net_salary, payment_method, 
        remarks, status, processed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const [result] = await db.query(query, [
            employee_type,
            employee_id,
            month,
            year,
            basic_salary,
            allowances || 0,
            deductions || 0,
            net_salary,
            payment_method,
            remarks,
            status || "pending",
            req.user.id, // Assuming req.user is set by auth middleware
        ]);

        res.status(201).json({
            message: "Payroll record created successfully",
            id: result.insertId,
        });
    } catch (error) {
        console.error("Error creating payroll record:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update payroll record
exports.updatePayrollRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            basic_salary,
            allowances,
            deductions,
            payment_method,
            remarks,
            status,
            payment_date,
        } = req.body;

        // Calculate net salary if salary components are updated
        let updateQuery = "UPDATE payroll SET ";
        const params = [];

        if (basic_salary !== undefined) {
            updateQuery += "basic_salary = ?, ";
            params.push(basic_salary);
        }
        if (allowances !== undefined) {
            updateQuery += "allowances = ?, ";
            params.push(allowances);
        }
        if (deductions !== undefined) {
            updateQuery += "deductions = ?, ";
            params.push(deductions);
        }
        if (payment_method) {
            updateQuery += "payment_method = ?, ";
            params.push(payment_method);
        }
        if (remarks) {
            updateQuery += "remarks = ?, ";
            params.push(remarks);
        }
        if (status) {
            updateQuery += "status = ?, ";
            params.push(status);
        }
        if (payment_date) {
            updateQuery += "payment_date = ?, ";
            params.push(payment_date);
        }

        // Recalculate net salary if needed (simplified for now, ideally fetch existing values first)
        // For this iteration, we'll assume if any salary part changes, the client sends all parts or we handle it more robustly.
        // To keep it simple and robust, let's fetch the current record first if we need to recalculate net_salary.

        // However, to avoid extra query if not needed, let's just update what's passed. 
        // If basic_salary, allowances, or deductions are passed, we should probably recalculate net_salary.

        if (basic_salary !== undefined || allowances !== undefined || deductions !== undefined) {
            // Fetch current values to recalculate net_salary correctly if only partial updates are sent
            const [current] = await db.query("SELECT * FROM payroll WHERE id = ?", [id]);
            if (current.length === 0) return res.status(404).json({ message: "Record not found" });

            const newBasic = basic_salary !== undefined ? parseFloat(basic_salary) : parseFloat(current[0].basic_salary);
            const newAllow = allowances !== undefined ? parseFloat(allowances) : parseFloat(current[0].allowances);
            const newDeduct = deductions !== undefined ? parseFloat(deductions) : parseFloat(current[0].deductions);
            const newNet = newBasic + newAllow - newDeduct;

            updateQuery += "net_salary = ?, ";
            params.push(newNet);
        }

        updateQuery = updateQuery.slice(0, -2); // Remove last comma
        updateQuery += " WHERE id = ?";
        params.push(id);

        await db.query(updateQuery, params);

        res.status(200).json({ message: "Payroll record updated successfully" });
    } catch (error) {
        console.error("Error updating payroll record:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete payroll record
exports.deletePayrollRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM payroll WHERE id = ?", [id]);
        res.status(200).json({ message: "Payroll record deleted successfully" });
    } catch (error) {
        console.error("Error deleting payroll record:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get employee payroll history
exports.getEmployeePayroll = async (req, res) => {
    try {
        const { type, id } = req.params;
        const query = `
            SELECT * FROM payroll 
            WHERE employee_type = ? AND employee_id = ? 
            ORDER BY year DESC, month DESC
        `;
        const [rows] = await db.query(query, [type, id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching employee payroll:", error);
        res.status(500).json({ message: "Server error" });
    }
};

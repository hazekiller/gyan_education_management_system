const db = require("../config/database");

const admissionsController = {
  // Get all admissions with filters
  getAll: async (req, res) => {
    try {
      const { status, search, start_date, end_date } = req.query;
      let query = `
        SELECT a.*, 
               c.name as class_name,
               u.email as processed_by_email
        FROM admissions a
        LEFT JOIN classes c ON a.class_applied_for = c.id
        LEFT JOIN users u ON a.processed_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += " AND a.status = ?";
        params.push(status);
      }

      if (search) {
        query +=
          " AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.application_number LIKE ? OR a.parent_phone LIKE ?)";
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (start_date) {
        query += " AND a.application_date >= ?";
        params.push(start_date);
      }

      if (end_date) {
        query += " AND a.application_date <= ?";
        params.push(end_date);
      }

      query += " ORDER BY a.created_at DESC";

      const [admissions] = await db.query(query, params);
      res.json({ success: true, data: admissions });
    } catch (error) {
      console.error("Error fetching admissions:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching admissions" });
    }
  },

  // Get single admission by ID
  getById: async (req, res) => {
    try {
      const [admission] = await db.query(
        `SELECT a.*, c.name as class_name 
         FROM admissions a 
         LEFT JOIN classes c ON a.class_applied_for = c.id 
         WHERE a.id = ?`,
        [req.params.id]
      );

      if (admission.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Admission not found" });
      }

      res.json({ success: true, data: admission[0] });
    } catch (error) {
      console.error("Error fetching admission:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching admission" });
    }
  },

  // Create new admission
  create: async (req, res) => {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        class_applied_for,
        previous_school,
        parent_name,
        parent_phone,
        parent_email,
        address,
        city,
        state,
        pincode,
      } = req.body;

      // Generate application number (e.g., APP-YYYY-TIMESTAMP)
      const application_number = `APP-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const [result] = await db.query(
        `INSERT INTO admissions (
          application_number, first_name, middle_name, last_name, 
          date_of_birth, gender, class_applied_for, previous_school,
          parent_name, parent_phone, parent_email, 
          address, city, state, pincode, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          application_number,
          first_name,
          middle_name,
          last_name,
          date_of_birth,
          gender,
          class_applied_for,
          previous_school,
          parent_name,
          parent_phone,
          parent_email,
          address,
          city,
          state,
          pincode,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Admission application created successfully",
        data: { id: result.insertId, application_number },
      });
    } catch (error) {
      console.error("Error creating admission:", error);
      res
        .status(500)
        .json({ success: false, message: "Error creating admission" });
    }
  },

  // Update admission
  update: async (req, res) => {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        class_applied_for,
        previous_school,
        parent_name,
        parent_phone,
        parent_email,
        address,
        city,
        state,
        pincode,
        status,
        remarks,
      } = req.body;

      const updateFields = [];
      const params = [];

      // Helper to add field if present
      const addField = (field, value) => {
        if (value !== undefined) {
          updateFields.push(`${field} = ?`);
          params.push(value);
        }
      };

      addField("first_name", first_name);
      addField("middle_name", middle_name);
      addField("last_name", last_name);
      addField("date_of_birth", date_of_birth);
      addField("gender", gender);
      addField("class_applied_for", class_applied_for);
      addField("previous_school", previous_school);
      addField("parent_name", parent_name);
      addField("parent_phone", parent_phone);
      addField("parent_email", parent_email);
      addField("address", address);
      addField("city", city);
      addField("state", state);
      addField("pincode", pincode);
      addField("status", status);
      addField("remarks", remarks);

      if (status) {
        // If status is changing, track who processed it
        updateFields.push("processed_by = ?");
        params.push(req.user.id);

        if (status === "admitted") {
          updateFields.push("admission_date = ?");
          params.push(new Date());
        }
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No fields to update" });
      }

      params.push(req.params.id);

      await db.query(
        `UPDATE admissions SET ${updateFields.join(", ")} WHERE id = ?`,
        params
      );

      res.json({ success: true, message: "Admission updated successfully" });
    } catch (error) {
      console.error("Error updating admission:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating admission" });
    }
  },

  // Delete admission
  delete: async (req, res) => {
    try {
      await db.query("DELETE FROM admissions WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Admission deleted successfully" });
    } catch (error) {
      console.error("Error deleting admission:", error);
      res
        .status(500)
        .json({ success: false, message: "Error deleting admission" });
    }
  },
};

module.exports = admissionsController;

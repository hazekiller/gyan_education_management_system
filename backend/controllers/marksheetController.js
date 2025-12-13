const db = require("../config/database");

// Create a new marksheet template
exports.createMarksheet = async (req, res) => {
    try {
        const { title, template_type, description, content } = req.body;

        if (!title || !template_type) {
            return res.status(400).json({
                success: false,
                message: "Title and Template Type are required",
            });
        }

        const [result] = await db.query(
            "INSERT INTO marksheets (title, template_type, description, content) VALUES (?, ?, ?, ?)",
            [title, template_type, description || "", content || ""]
        );

        const [newMarksheet] = await db.query(
            "SELECT * FROM marksheets WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Marksheet template created successfully",
            data: newMarksheet[0],
        });
    } catch (error) {
        console.error("Error creating marksheet:", error);
        res.status(500).json({
            success: false,
            message: "Error creating marksheet template",
            error: error.message,
        });
    }
};

// Get all marksheet templates
exports.getAllMarksheets = async (req, res) => {
    try {
        const [marksheets] = await db.query(
            "SELECT * FROM marksheets ORDER BY created_at DESC"
        );

        res.status(200).json({
            success: true,
            data: marksheets,
        });
    } catch (error) {
        console.error("Error fetching marksheets:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching marksheet templates",
            error: error.message,
        });
    }
};

// Get single marksheet by ID
exports.getMarksheetById = async (req, res) => {
    try {
        const { id } = req.params;
        const [marksheet] = await db.query(
            "SELECT * FROM marksheets WHERE id = ?",
            [id]
        );

        if (marksheet.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Marksheet template not found",
            });
        }

        res.status(200).json({
            success: true,
            data: marksheet[0],
        });
    } catch (error) {
        console.error("Error fetching marksheet:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching marksheet template",
            error: error.message,
        });
    }
};

// Update marksheet template
exports.updateMarksheet = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, template_type, description, content } = req.body;

        const [existing] = await db.query("SELECT * FROM marksheets WHERE id = ?", [
            id,
        ]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Marksheet template not found",
            });
        }

        await db.query(
            "UPDATE marksheets SET title = ?, template_type = ?, description = ?, content = ? WHERE id = ?",
            [
                title || existing[0].title,
                template_type || existing[0].template_type,
                description || existing[0].description,
                content !== undefined ? content : existing[0].content,
                id,
            ]
        );

        const [updated] = await db.query("SELECT * FROM marksheets WHERE id = ?", [
            id,
        ]);

        res.status(200).json({
            success: true,
            message: "Marksheet template updated successfully",
            data: updated[0],
        });
    } catch (error) {
        console.error("Error updating marksheet:", error);
        res.status(500).json({
            success: false,
            message: "Error updating marksheet template",
            error: error.message,
        });
    }
};

// Delete marksheet template
exports.deleteMarksheet = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query("DELETE FROM marksheets WHERE id = ?", [
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Marksheet template not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Marksheet template deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting marksheet:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting marksheet template",
            error: error.message,
        });
    }
};

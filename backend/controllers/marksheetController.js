const db = require("../config/database");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Helper function to replace placeholders in template
const replacePlaceholders = (template, data) => {
    let result = template;

    // Replace all placeholders with actual data
    Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = data[key] || '';
        result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    return result;
};

// Generate PDF from marksheet template
exports.generateMarksheetPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const studentData = req.body;

        // Get the marksheet template
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

        const template = marksheet[0];

        // Replace placeholders with actual student data
        let htmlContent = replacePlaceholders(template.content, studentData);

        // Create a simple HTML to PDF conversion
        // Since we're using inline styles, we can create a basic PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=marksheet_${studentData.student_name || 'student'}_${Date.now()}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text(studentData.school_name || 'School Name', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Academic Progress Report', { align: 'center' });
        doc.moveDown(2);

        // Student Information
        doc.fontSize(12);
        doc.text(`Student Name: ${studentData.student_name || 'N/A'}`);
        doc.text(`Roll Number: ${studentData.roll_number || 'N/A'}`);
        doc.text(`Class: ${studentData.class || 'N/A'} - Section: ${studentData.section || 'N/A'}`);
        doc.text(`Examination: ${studentData.exam_name || 'N/A'}`);
        doc.moveDown(2);

        // Results Summary
        doc.fontSize(14).text('Results Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Total Marks: ${studentData.total_marks || 'N/A'}`);
        doc.text(`Percentage: ${studentData.percentage || 'N/A'}%`);
        doc.text(`Grade: ${studentData.grade || 'N/A'}`);
        doc.text(`Result: ${studentData.result_status || 'N/A'}`);

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({
            success: false,
            message: "Error generating marksheet PDF",
            error: error.message,
        });
    }
};

// Create a new marksheet template
exports.createMarksheet = async (req, res) => {
    try {
        const { title, template_type, description, content, template_design } = req.body;

        if (!title || !template_type) {
            return res.status(400).json({
                success: false,
                message: "Title and Template Type are required",
            });
        }

        // Load predefined templates
        const templates = require('../marksheetTemplates');

        // Use provided content or get from template_design
        let templateContent = content || "";
        if (!content && template_design && templates[template_design]) {
            templateContent = templates[template_design];
        }

        const [result] = await db.query(
            "INSERT INTO marksheets (title, template_type, description, content, template_design) VALUES (?, ?, ?, ?, ?)",
            [title, template_type, description || "", templateContent, template_design || "schoolMarksheet"]
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
        const { title, template_type, description, content, template_design } = req.body;

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
            "UPDATE marksheets SET title = ?, template_type = ?, description = ?, content = ?, template_design = ? WHERE id = ?",
            [
                title || existing[0].title,
                template_type || existing[0].template_type,
                description || existing[0].description,
                content !== undefined ? content : existing[0].content,
                template_design || existing[0].template_design,
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

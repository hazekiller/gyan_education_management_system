const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve uploaded files with authentication
router.get('/*', (req, res) => {
    try {
        // Get the file path from the request
        const filePath = path.join(__dirname, '..', 'uploads', req.params[0]);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'Error serving file'
        });
    }
});

module.exports = router;

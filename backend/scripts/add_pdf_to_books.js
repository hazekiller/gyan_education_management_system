const pool = require('../config/database');

const migrate = async () => {
    try {
        console.log('Adding pdf_url column to library_books table...');

        // Check if column exists
        const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'library_books' 
      AND COLUMN_NAME = 'pdf_url'
    `);

        if (columns.length === 0) {
            await pool.query(`
        ALTER TABLE library_books 
        ADD COLUMN pdf_url VARCHAR(255) DEFAULT NULL AFTER description
      `);
            console.log('✅ pdf_url column added successfully');
        } else {
            console.log('ℹ️ pdf_url column already exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();

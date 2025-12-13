const db = require('../config/database');

const fixExamsSchema = async () => {
    try {
        console.log('Fixing exams table schema...');

        // Add created_by column to exams
        await db.query(`
      ALTER TABLE exams
      ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
      ADD CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    `);

        console.log('✅ Column created_by added to exams table.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
};

fixExamsSchema();

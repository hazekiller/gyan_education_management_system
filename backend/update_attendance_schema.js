const pool = require('./config/database');

async function updateSchema() {
    try {
        console.log('Updating attendance table schema...');

        // Add subject_id column
        try {
            await pool.query(`
                ALTER TABLE attendance 
                ADD COLUMN subject_id INT NULL AFTER section_id,
                ADD FOREIGN KEY (subject_id) REFERENCES subjects(id)
            `);
            console.log('Added subject_id column');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('subject_id column already exists');
            } else {
                console.error('Error adding subject_id:', error.message);
            }
        }

        // Add submission tracking columns
        const columns = [
            'is_submitted BOOLEAN DEFAULT FALSE',
            'submitted_at DATETIME NULL',
            'submitted_by INT NULL'
        ];

        for (const colDef of columns) {
            try {
                const colName = colDef.split(' ')[0];
                await pool.query(`ALTER TABLE attendance ADD COLUMN ${colDef}`);
                console.log(`Added ${colName} column`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`${colDef.split(' ')[0]} column already exists`);
                } else {
                    console.error(`Error adding ${colDef.split(' ')[0]}:`, error.message);
                }
            }
        }

        // Add foreign key for submitted_by if not exists
        // Note: checking if FK exists is harder in raw SQL, so we might just try adding it
        // or skip if we assume it was added with the column if we did it differently.
        // Let's just try to add the constraint, it might fail if duplicate but that's fine.
        try {
            await pool.query(`
                ALTER TABLE attendance
                ADD CONSTRAINT fk_attendance_submitted_by
                FOREIGN KEY (submitted_by) REFERENCES users(id)
            `);
            console.log('Added submitted_by foreign key');
        } catch (error) {
            if (error.code === 'ER_DUP_KEY' || error.errno === 1061) {
                console.log('fk_attendance_submitted_by already exists');
            } else {
                console.log('Error adding foreign key (might already exist):', error.message);
            }
        }

        console.log('Schema update complete');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();

const pool = require('./config/database');

async function fixClassesSchema() {
    const connection = await pool.getConnection();
    try {
        console.log('Starting schema update for table: classes');

        // Check existing columns first to avoid duplicate column errors if script is re-run
        const [columns] = await connection.query('DESCRIBE classes');
        const existingColumns = columns.map(col => col.Field);

        const columnsToAdd = [
            { name: 'class_teacher_id', definition: 'INT DEFAULT NULL' },
            { name: 'room_number', definition: 'VARCHAR(50) DEFAULT NULL' },
            { name: 'capacity', definition: 'INT DEFAULT 40' },
            { name: 'status', definition: "ENUM('active','inactive','archived') DEFAULT 'active'" }
        ];

        for (const col of columnsToAdd) {
            if (!existingColumns.includes(col.name)) {
                console.log(`Adding column: ${col.name}`);
                await connection.query(`ALTER TABLE classes ADD COLUMN ${col.name} ${col.definition}`);
            } else {
                console.log(`Column ${col.name} already exists, skipping.`);
            }
        }

        console.log('Schema update completed successfully.');

        // Verify the changes
        const [updatedColumns] = await connection.query('DESCRIBE classes');
        console.log('Updated columns in classes table:');
        updatedColumns.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

fixClassesSchema();

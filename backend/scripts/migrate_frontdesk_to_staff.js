const pool = require('../config/database');

async function migrateFrontdeskToStaff() {
    const connection = await pool.getConnection();
    try {
        console.log('Starting migration: Consolidating frontdesk into staff table...');

        await connection.beginTransaction();

        // Step 1: Add shift_timing column to staff table if it doesn't exist
        console.log('Step 1: Adding shift_timing column to staff table...');
        await connection.query(`
            ALTER TABLE staff 
            ADD COLUMN IF NOT EXISTS shift_timing VARCHAR(50) DEFAULT NULL
        `);
        console.log('✓ shift_timing column added');

        // Step 2: Check if frontdesk table exists
        const [tables] = await connection.query(`
            SHOW TABLES LIKE 'frontdesk'
        `);

        if (tables.length > 0) {
            console.log('Step 2: Migrating data from frontdesk to staff table...');

            // Get all frontdesk records
            const [frontdeskRecords] = await connection.query(`
                SELECT * FROM frontdesk
            `);

            console.log(`Found ${frontdeskRecords.length} frontdesk records to migrate`);

            // Migrate each record
            for (const record of frontdeskRecords) {
                // Check if this record already exists in staff (by employee_id)
                const [existing] = await connection.query(
                    'SELECT id FROM staff WHERE employee_id = ?',
                    [record.employee_id]
                );

                if (existing.length > 0) {
                    // Update existing staff record with frontdesk data
                    console.log(`Updating existing staff record: ${record.employee_id}`);
                    await connection.query(`
                        UPDATE staff 
                        SET shift_timing = ?,
                            designation = 'Frontdesk',
                            department = 'Front Desk'
                        WHERE employee_id = ?
                    `, [record.shift_timing, record.employee_id]);
                } else {
                    // Insert new staff record from frontdesk
                    console.log(`Migrating frontdesk record: ${record.employee_id}`);
                    await connection.query(`
                        INSERT INTO staff (
                            user_id, employee_id, first_name, middle_name, last_name,
                            date_of_birth, gender, blood_group, address, city, state, pincode,
                            phone, emergency_contact, designation, department,
                            joining_date, salary, shift_timing, profile_photo, status,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        record.user_id,
                        record.employee_id,
                        record.first_name,
                        record.middle_name,
                        record.last_name,
                        record.date_of_birth,
                        record.gender,
                        record.blood_group,
                        record.address,
                        record.city,
                        record.state,
                        record.pincode,
                        record.phone,
                        record.emergency_contact,
                        'Frontdesk', // designation
                        'Front Desk', // department
                        record.joining_date,
                        record.salary,
                        record.shift_timing,
                        record.profile_photo,
                        record.status,
                        record.created_at,
                        record.updated_at
                    ]);
                }
            }

            console.log('✓ Data migration completed');

            // Step 3: Drop frontdesk-related tables
            console.log('Step 3: Dropping frontdesk-related tables...');

            // Drop dependent tables first
            await connection.query('DROP TABLE IF EXISTS frontdesk_inquiries');
            console.log('✓ Dropped frontdesk_inquiries table');

            await connection.query('DROP TABLE IF EXISTS frontdesk_visitors');
            console.log('✓ Dropped frontdesk_visitors table');

            await connection.query('DROP TABLE IF EXISTS frontdesk');
            console.log('✓ Dropped frontdesk table');
        } else {
            console.log('No frontdesk table found, skipping data migration');
        }

        await connection.commit();
        console.log('\n✅ Migration completed successfully!');
        console.log('Summary:');
        console.log('- Added shift_timing column to staff table');
        console.log('- Migrated frontdesk data to staff table');
        console.log('- Removed frontdesk, frontdesk_visitors, and frontdesk_inquiries tables');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Run migration
migrateFrontdeskToStaff()
    .then(() => {
        console.log('\nMigration script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nMigration script failed:', error);
        process.exit(1);
    });

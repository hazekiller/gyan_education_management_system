
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSubjects() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const classId = 9; // From previous run
        const sectionId = 7; // From previous run

        // Check class_subjects (Class level)
        console.log(`Checking class_subjects for class_id ${classId}...`);
        const [classSubjects] = await connection.execute('SELECT * FROM class_subjects WHERE class_id = ?', [classId]);
        console.log('Class Subjects Count:', classSubjects.length);
        console.log('Class Subjects IDs:', classSubjects.map(cs => cs.subject_id));

        // Check section_subject_teachers (Section level?)
        console.log('Checking section_subject_teachers...');
        const [sstCols] = await connection.execute('DESCRIBE section_subject_teachers');
        console.log('SST Columns:', sstCols.map(c => c.Field));

        // If SST has section_id, check it
        if (sstCols.find(c => c.Field === 'section_id')) {
            const [sectionSubjects] = await connection.execute('SELECT * FROM section_subject_teachers WHERE section_id = ?', [sectionId]);
            console.log('Section Subjects Count:', sectionSubjects.length);
            console.log('Section Subjects:', sectionSubjects);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSubjects();

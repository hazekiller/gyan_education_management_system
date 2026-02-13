const pool = require('./config/database');
const fs = require('fs');

async function inspectDB() {
    let output = '--- DATABASE INSPECTION ---\n';
    try {
        const tables = ['classes', 'sections', 'subjects', 'class_subjects', 'students', 'teachers', 'staff'];
        
        for (const table of tables) {
            output += `\nTable: ${table}\n`;
            try {
                const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT 10`);
                output += JSON.stringify(rows, null, 2) + '\n';
            } catch (err) {
                output += `  Error reading ${table}: ${err.message}\n`;
            }
        }
        
        fs.writeFileSync('db_inspection_results.txt', output);
        console.log('Inspection results saved to db_inspection_results.txt');
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspectDB();

const db = require("./config/database");

const updateMarksheetsTable = async () => {
    try {
        console.log("Updating marksheets table schema...");

        // Check if 'content' column exists
        const [columns] = await db.query(`SHOW COLUMNS FROM marksheets LIKE 'content'`);

        if (columns.length === 0) {
            const query = `
          ALTER TABLE marksheets
          ADD COLUMN content LONGTEXT
        `;
            await db.query(query);
            console.log("✅ 'content' column added to marksheets table");
        } else {
            console.log("ℹ️ 'content' column already exists");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating marksheets table:", error);
        process.exit(1);
    }
};

updateMarksheetsTable();

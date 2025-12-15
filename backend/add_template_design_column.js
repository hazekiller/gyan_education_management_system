const db = require("./config/database");

const addTemplateDesignColumn = async () => {
    try {
        console.log("Adding template_design column to marksheets table...");

        // Check if 'template_design' column exists
        const [columns] = await db.query(`SHOW COLUMNS FROM marksheets LIKE 'template_design'`);

        if (columns.length === 0) {
            const query = `
          ALTER TABLE marksheets
          ADD COLUMN template_design VARCHAR(50) DEFAULT 'schoolMarksheet' AFTER template_type
        `;
            await db.query(query);
            console.log("✅ 'template_design' column added to marksheets table");
        } else {
            console.log("ℹ️ 'template_design' column already exists");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding template_design column:", error);
        process.exit(1);
    }
};

addTemplateDesignColumn();

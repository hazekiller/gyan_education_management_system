const db = require("./config/database");
const templates = require("./marksheetTemplates");

const seedTemplates = async () => {
    try {
        console.log("🌱 Seeding marksheet templates...");

        // Check if templates already exist
        const [existing] = await db.query("SELECT COUNT(*) as count FROM marksheets");

        if (existing[0].count > 0) {
            console.log(`ℹ️  Found ${existing[0].count} existing templates. Skipping seed.`);
            console.log("   To re-seed, delete existing templates first.");
            process.exit(0);
        }

        const templatesToSeed = [
            {
                title: "Standard School Marksheet",
                template_type: "exam",
                description: "A comprehensive marksheet format suitable for primary and secondary schools including grade tables and remarks.",
                content: templates.schoolMarksheet
            },
            {
                title: "College Transcript Template",
                template_type: "semester",
                description: "Professional semester-wise transcript layout for colleges and universities with GPA calculation fields.",
                content: templates.collegeTranscript
            },
            {
                title: "Term Assessment Report",
                template_type: "test",
                description: "Modern and colorful layout for periodic term assessments and unit tests with visual appeal.",
                content: templates.termAssessment
            }
        ];

        for (const template of templatesToSeed) {
            await db.query(
                "INSERT INTO marksheets (title, template_type, description, content) VALUES (?, ?, ?, ?)",
                [template.title, template.template_type, template.description, template.content]
            );
            console.log(`✅ Seeded: ${template.title}`);
        }

        console.log("\n🎉 Successfully seeded all marksheet templates!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding templates:", error);
        process.exit(1);
    }
};

seedTemplates();

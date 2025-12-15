const db = require("./config/database");
const templates = require("./marksheetTemplates");

const updateExistingTemplates = async () => {
    try {
        console.log("🔄 Updating existing marksheet templates with content...");

        // Get all existing templates
        const [existing] = await db.query("SELECT * FROM marksheets");

        if (existing.length === 0) {
            console.log("ℹ️  No templates found to update.");
            process.exit(0);
        }

        console.log(`Found ${existing.length} templates to update.`);

        // Update templates based on their type and title
        for (const template of existing) {
            let content = null;

            // Match templates by title or type
            if (template.title.toLowerCase().includes('school') && template.template_type === 'exam') {
                content = templates.schoolMarksheet;
                console.log(`✅ Updating: ${template.title} with School Marksheet template`);
            } else if (template.title.toLowerCase().includes('college') || template.title.toLowerCase().includes('transcript')) {
                content = templates.collegeTranscript;
                console.log(`✅ Updating: ${template.title} with College Transcript template`);
            } else if (template.title.toLowerCase().includes('term') || template.title.toLowerCase().includes('assessment')) {
                content = templates.termAssessment;
                console.log(`✅ Updating: ${template.title} with Term Assessment template`);
            } else if (template.template_type === 'exam') {
                content = templates.schoolMarksheet;
                console.log(`✅ Updating: ${template.title} with School Marksheet template (default for exam type)`);
            } else if (template.template_type === 'semester') {
                content = templates.collegeTranscript;
                console.log(`✅ Updating: ${template.title} with College Transcript template (default for semester type)`);
            } else if (template.template_type === 'test') {
                content = templates.termAssessment;
                console.log(`✅ Updating: ${template.title} with Term Assessment template (default for test type)`);
            }

            if (content) {
                await db.query(
                    "UPDATE marksheets SET content = ? WHERE id = ?",
                    [content, template.id]
                );
            } else {
                console.log(`⚠️  Skipped: ${template.title} - No matching template found`);
            }
        }

        console.log("\n🎉 Successfully updated all marksheet templates!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating templates:", error);
        process.exit(1);
    }
};

updateExistingTemplates();

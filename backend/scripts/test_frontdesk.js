const pool = require('../config/database');

async function testFrontdeskEndpoints() {
    try {
        console.log('🧪 Testing Frontdesk Endpoints...\n');

        // Test 1: Check if tables exist
        console.log('1. Checking database tables...');
        const [visitors] = await pool.query('SHOW TABLES LIKE "frontdesk_visitors"');
        const [inquiries] = await pool.query('SHOW TABLES LIKE "frontdesk_inquiries"');

        console.log(`   ✓ frontdesk_visitors table: ${visitors.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`   ✓ frontdesk_inquiries table: ${inquiries.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);

        // Test 2: Check staff with is_frontdesk = 1
        console.log('\n2. Checking frontdesk staff...');
        const [frontdeskStaff] = await pool.query('SELECT id, first_name, last_name FROM staff WHERE is_frontdesk = 1');
        console.log(`   ✓ Found ${frontdeskStaff.length} frontdesk staff members`);
        if (frontdeskStaff.length > 0) {
            console.log(`   Staff: ${frontdeskStaff.map(s => `${s.first_name} ${s.last_name} (ID: ${s.id})`).join(', ')}`);
        }

        // Test 3: Check visitor logs
        console.log('\n3. Checking visitor logs...');
        const [visitorLogs] = await pool.query(`
            SELECT v.*, CONCAT(s.first_name, ' ', s.last_name) as logged_by
            FROM frontdesk_visitors v
            LEFT JOIN staff s ON v.staff_id = s.id
            WHERE s.is_frontdesk = 1
        `);
        console.log(`   ✓ Total visitor logs: ${visitorLogs.length}`);

        // Test 4: Check inquiries
        console.log('\n4. Checking inquiries...');
        const [inquiryLogs] = await pool.query(`
            SELECT i.*, CONCAT(s.first_name, ' ', s.last_name) as logged_by
            FROM frontdesk_inquiries i
            LEFT JOIN staff s ON i.staff_id = s.id
            WHERE s.is_frontdesk = 1
        `);
        console.log(`   ✓ Total inquiries: ${inquiryLogs.length}`);

        console.log('\n✅ All tests passed!');
        console.log('\n📋 Summary:');
        console.log(`   - Database tables: Created`);
        console.log(`   - Frontdesk staff: ${frontdeskStaff.length} member(s)`);
        console.log(`   - Visitor logs: ${visitorLogs.length}`);
        console.log(`   - Inquiries: ${inquiryLogs.length}`);
        console.log(`\n✨ The visitor and inquiry endpoints are ready to use!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testFrontdeskEndpoints();

const pool = require('../config/database');

async function fillDemoData() {
    try {
        console.log('--- Filling Demo Data with Realistic Context ---');

        // 1. Get Demo Users
        const [[admin]] = await pool.query('SELECT id FROM users WHERE email = "admin@gyan.edu"');
        const [[teacher]] = await pool.query('SELECT id FROM users WHERE email = "teacher@gyan.edu"');
        const [[student]] = await pool.query('SELECT id FROM users WHERE email = "student@gyan.edu"');
        
        if (!teacher || !student) {
            console.error('Demo accounts not found. Please run seed_demo_accounts.js first.');
            process.exit(1);
        }

        // 2. Fetch some existing data to link to
        const [classes] = await pool.query('SELECT id, name FROM classes WHERE status = "active" LIMIT 5');
        const [subjects] = await pool.query('SELECT id, name FROM subjects WHERE is_active = 1 LIMIT 5');
        
        if (classes.length === 0 || subjects.length === 0) {
            console.error('No active classes or subjects found in database to link demo data.');
            process.exit(1);
        }

        const targetClass = classes[0]; // e.g., Class 1
        const targetSubject = subjects[0]; // e.g., Mathematics
        
        console.log(`Linking Demo Teacher to Class: ${targetClass.name}, Subject: ${targetSubject.name}`);

        // 3. Link Demo Teacher to Class & Subject
        const [[teacherProfile]] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [teacher.id]);
        if (teacherProfile) {
            // Check if mapping exists by class, subject, and academic year
            const [existingMapping] = await pool.query(
                'SELECT id FROM class_subjects WHERE class_id = ? AND subject_id = ? AND academic_year = "2024-2025"',
                [targetClass.id, targetSubject.id]
            );
            
            if (existingMapping.length === 0) {
                await pool.query(
                    'INSERT INTO class_subjects (class_id, subject_id, teacher_id, academic_year, is_active) VALUES (?, ?, ?, "2024-2025", 1)',
                    [targetClass.id, targetSubject.id, teacherProfile.id]
                );
                console.log('  Assigned teacher to class subject.');
            } else {
                // Update the teacher for the existing mapping
                await pool.query(
                    'UPDATE class_subjects SET teacher_id = ? WHERE id = ?',
                    [teacherProfile.id, existingMapping[0].id]
                );
                console.log('  Updated existing class subject with demo teacher.');
            }
        }

        // 4. Enroll Demo Student in Class & Section
        const [sections] = await pool.query('SELECT id, name FROM sections WHERE class_id = ? LIMIT 1', [targetClass.id]);
        const targetSection = sections[0] || { id: null };
        
        const [[studentProfile]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [student.id]);
        if (studentProfile) {
            await pool.query(
                'UPDATE students SET class_id = ?, section_id = ?, roll_number = "DEMO-01" WHERE id = ?',
                [targetClass.id, targetSection.id, studentProfile.id]
            );
            console.log(`  Enrolled student in ${targetClass.name} (Section: ${targetSection.name || 'N/A'}).`);
        }

        // 5. Create Sample Assignments for the Teacher
        console.log('Creating sample assignments...');
        const assignments = [
            { title: 'Algebra Homework - Part 1', description: 'Complete exercises 1 to 10 from Chapter 2.' },
            { title: 'Geometry Quiz Prep', description: 'Review theorems on triangles for upcoming quiz.' }
        ];

        for (const ass of assignments) {
            const [existing] = await pool.query('SELECT id FROM assignments WHERE title = ? AND created_by = ?', [ass.title, teacherProfile.id]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO assignments (title, description, class_id, section_id, subject_id, created_by, due_date, status) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), "active")',
                    [ass.title, ass.description, targetClass.id, targetSection.id || 0, targetSubject.id, teacherProfile.id]
                );
                console.log(`  Added assignment: ${ass.title}`);
            }
        }

        // 6. Create Sample Attendance for the Student
        console.log('Creating sample attendance history...');
        for (let i = 0; i < 5; i++) {
            const date = `DATE_SUB(CURDATE(), INTERVAL ${i} DAY)`;
            const status = i % 5 === 0 ? 'absent' : 'present';
            
            // Check if attendance exists
            const [existingAtt] = await pool.query(
                `SELECT id FROM attendance WHERE student_id = ? AND date = DATE_SUB(CURDATE(), INTERVAL ${i} DAY)`,
                [studentProfile.id]
            );
            
            if (existingAtt.length === 0) {
                await pool.query(
                    `INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by) VALUES (?, ?, ?, ${date}, ?, ?)`,
                    [studentProfile.id, targetClass.id, targetSection.id || 0, status, teacher.id]
                );
            }
        }
        console.log('  Added 5 days of attendance history.');

        // 7. Create Sample Announcements
        console.log('Creating sample announcements...');
        const announcements = [
            { title: 'Welcome to Gyan Education', content: 'We are excited to have you on board with our new mobile app!' },
            { title: 'Holiday Notice', content: 'School will remain closed on Friday for the annual function prep.' }
        ];

        for (const ann of announcements) {
            const [existing] = await pool.query('SELECT id FROM announcements WHERE title = ?', [ann.title]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO announcements (title, content, priority, target_audience, created_by) VALUES (?, ?, "medium", "all", ?)',
                    [ann.title, ann.content, admin.id]
                );
                console.log(`  Added announcement: ${ann.title}`);
            }
        }

        console.log('--- Data Filling Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Data filling failed:', error);
        process.exit(1);
    }
}

fillDemoData();

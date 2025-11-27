const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
    let connection;

    try {
        console.log('\n🌱 Starting database seeding...\n');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gyan_school_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        // Helper to get random item from array
        const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // 1. Create Teachers
        console.log('Creating teachers...');
        const teachersData = [
            { first: 'John', last: 'Doe', email: 'john.doe@gyan.edu', subject: 'Mathematics' },
            { first: 'Jane', last: 'Smith', email: 'jane.smith@gyan.edu', subject: 'Science' },
            { first: 'Robert', last: 'Brown', email: 'robert.brown@gyan.edu', subject: 'English' },
            { first: 'Emily', last: 'Davis', email: 'emily.davis@gyan.edu', subject: 'History' },
            { first: 'Michael', last: 'Wilson', email: 'michael.wilson@gyan.edu', subject: 'Computer Science' }
        ];

        const teacherPassword = await bcrypt.hash('Teacher@123', 10);

        for (let i = 0; i < teachersData.length; i++) {
            const t = teachersData[i];
            // Create User
            const [userRes] = await connection.query(
                'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
                [t.email, teacherPassword, 'teacher', true]
            );
            const userId = userRes.insertId;

            // Create Teacher Profile
            await connection.query(
                `INSERT INTO teachers (
          user_id, employee_id, first_name, last_name, 
          date_of_birth, gender, phone, qualification, 
          joining_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    `EMP${100 + i}`,
                    t.first,
                    t.last,
                    '1985-01-01',
                    'male',
                    '9800000000',
                    'M.Ed',
                    '2020-01-01',
                    'active'
                ]
            );
        }
        console.log(`✅ Created ${teachersData.length} teachers`);

        // 2. Create Students
        console.log('Creating students...');
        const studentPassword = await bcrypt.hash('Student@123', 10);

        // Get Class 1 and Class 2 IDs
        const [classes] = await connection.query('SELECT id, name FROM classes WHERE grade_level IN (1, 2)');
        const class1 = classes.find(c => c.name.includes('1'));
        const class2 = classes.find(c => c.name.includes('2'));

        // Get Sections for Class 1
        const [sections] = await connection.query('SELECT id, name FROM sections WHERE class_id = ?', [class1.id]);
        const sectionA = sections.find(s => s.name === 'A');
        const sectionB = sections.find(s => s.name === 'B');

        const studentsData = [
            { first: 'Alice', last: 'Johnson', classId: class1.id, sectionId: sectionA.id },
            { first: 'Bob', last: 'Williams', classId: class1.id, sectionId: sectionA.id },
            { first: 'Charlie', last: 'Brown', classId: class1.id, sectionId: sectionB.id },
            { first: 'Diana', last: 'Miller', classId: class1.id, sectionId: sectionB.id },
            { first: 'Evan', last: 'Davis', classId: class2.id, sectionId: null }, // Class 2 might not have sections in migrate.js yet or we didn't fetch them all
        ];

        for (let i = 0; i < studentsData.length; i++) {
            const s = studentsData[i];
            const email = `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.gyan.edu`;

            // Create User
            const [userRes] = await connection.query(
                'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
                [email, studentPassword, 'student', true]
            );
            const userId = userRes.insertId;

            // Create Student Profile
            await connection.query(
                `INSERT INTO students (
          user_id, admission_number, first_name, last_name, 
          date_of_birth, gender, parent_phone, class_id, section_id, 
          admission_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    `ADM${202400 + i}`,
                    s.first,
                    s.last,
                    '2015-01-01',
                    'male', // simplifying
                    '9841000000',
                    s.classId,
                    s.sectionId,
                    '2024-04-01',
                    'active'
                ]
            );
        }
        console.log(`✅ Created ${studentsData.length} students`);

        // 3. Create Fee Heads
        console.log('Creating fee heads...');
        const feeHeads = [
            { name: 'Tuition Fee', description: 'Monthly tuition fee' },
            { name: 'Exam Fee', description: 'Term examination fee' },
            { name: 'Lab Fee', description: 'Science laboratory fee' },
            { name: 'Transportation Fee', description: 'Bus service fee' },
            { name: 'Admission Fee', description: 'One time admission fee' }
        ];

        for (const head of feeHeads) {
            await connection.query(
                'INSERT INTO fee_heads (name, description) VALUES (?, ?)',
                [head.name, head.description]
            );
        }
        console.log(`✅ Created ${feeHeads.length} fee heads`);

        // 4. Create Fee Structures
        console.log('Creating fee structures...');

        // Get Fee Head IDs
        const [heads] = await connection.query('SELECT id, name FROM fee_heads');
        const tuitionHead = heads.find(h => h.name === 'Tuition Fee');
        const examHead = heads.find(h => h.name === 'Exam Fee');
        const admissionHead = heads.find(h => h.name === 'Admission Fee');

        const feeStructures = [
            // Class 1 Tuition
            {
                class_id: class1.id,
                fee_head_id: tuitionHead.id,
                amount: 5000,
                academic_year: '2024-2025',
                period_type: 'monthly',
                period_value: '1', // Baisakh
                due_date: '2024-05-15'
            },
            {
                class_id: class1.id,
                fee_head_id: tuitionHead.id,
                amount: 5000,
                academic_year: '2024-2025',
                period_type: 'monthly',
                period_value: '2', // Jestha
                due_date: '2024-06-15'
            },
            // Class 1 Exam
            {
                class_id: class1.id,
                fee_head_id: examHead.id,
                amount: 1500,
                academic_year: '2024-2025',
                period_type: 'semester',
                period_value: '1',
                due_date: '2024-08-15'
            },
            // Class 1 Admission
            {
                class_id: class1.id,
                fee_head_id: admissionHead.id,
                amount: 10000,
                academic_year: '2024-2025',
                period_type: 'one_time',
                period_value: null,
                due_date: '2024-04-15'
            }
        ];

        for (const fs of feeStructures) {
            await connection.query(
                `INSERT INTO fee_structure (
          class_id, fee_head_id, amount, academic_year, 
          period_type, period_value, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [fs.class_id, fs.fee_head_id, fs.amount, fs.academic_year, fs.period_type, fs.period_value, fs.due_date]
            );
        }
        console.log(`✅ Created ${feeStructures.length} fee structures`);

        // 5. Create Fee Payments
        console.log('Creating fee payments...');

        // Get Alice
        const [alice] = await connection.query('SELECT id FROM students WHERE first_name = "Alice"');

        // Get Fee Structures for Class 1
        const [structures] = await connection.query('SELECT id, fee_head_id, amount FROM fee_structure WHERE class_id = ?', [class1.id]);

        // Alice pays Admission Fee
        const admissionStructure = structures.find(s => s.fee_head_id === admissionHead.id);
        if (admissionStructure && alice.length > 0) {
            await connection.query(
                `INSERT INTO fee_payments (
          student_id, fee_structure_id, amount_paid, payment_date, 
          payment_method, receipt_number, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    alice[0].id,
                    admissionStructure.id,
                    admissionStructure.amount,
                    '2024-04-10',
                    'cash',
                    'REC-001',
                    'completed'
                ]
            );
            console.log('✅ Created payment for Alice (Admission)');
        }

        // Alice pays Tuition for Baisakh
        const tuitionStructure = structures.find(s => s.fee_head_id === tuitionHead.id); // Just picks the first one found (Baisakh likely)
        if (tuitionStructure && alice.length > 0) {
            await connection.query(
                `INSERT INTO fee_payments (
          student_id, fee_structure_id, amount_paid, payment_date, 
          payment_method, receipt_number, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    alice[0].id,
                    tuitionStructure.id,
                    tuitionStructure.amount,
                    '2024-05-10',
                    'online',
                    'REC-002',
                    'completed'
                ]
            );
            console.log('✅ Created payment for Alice (Tuition)');
        }

        console.log('\n🎉 Seeding completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed\n');
        }
    }
};

seed();

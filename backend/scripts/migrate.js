// File: backend/scripts/migrate.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const migrate = async () => {
  let connection;

  try {
    console.log('\n🔄 Starting database migration...\n');

    // Create connection to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'gyan_school_db'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'gyan_school_db'}' created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'gyan_school_db'}`);

    // Drop tables if they exist (for fresh migration)
    console.log('\n🗑️  Dropping existing tables...');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const dropTables = [
      'assignment_submissions',
      'assignments',
      'exam_results',
      'exam_schedule',
      'exams',
      'attendance',
      'timetable',
      'class_subjects',
      'subjects',
      'fee_payments',
      'fee_structure',
      'fee_heads', // Added fee_heads to drop list
      'payroll',
      'study_materials',
      'syllabus',
      'library_transactions',
      'library_books',
      'student_transport',
      'transport_routes',
      'admissions',
      'visitors',
      'messages',
      'notifications',
      'announcements',
      'events',
      'staff',
      'teachers',
      'students',
      'sections',
      'classes',
      'users'
    ];

    for (const table of dropTables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Old tables dropped');

    console.log('\n📦 Creating tables...\n');

    // 1. Users table
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'principal', 'vice_principal', 'hod', 'teacher', 'student', 'accountant', 'guard', 'cleaner') NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: users');

    // 2. Classes table
    await connection.query(`
      CREATE TABLE classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        grade_level INT NOT NULL,
        description TEXT,
        academic_year VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_grade (grade_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: classes');

    // 3. Sections table
    await connection.query(`
      CREATE TABLE sections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        class_id INT NOT NULL,
        class_teacher_id INT,
        capacity INT DEFAULT 40,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        INDEX idx_class (class_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: sections');

    // 4. Students table
    await connection.query(`
      CREATE TABLE students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        admission_number VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        blood_group VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        phone VARCHAR(20),
        parent_phone VARCHAR(20) NOT NULL,
        parent_email VARCHAR(255),
        father_name VARCHAR(255),
        mother_name VARCHAR(255),
        guardian_name VARCHAR(255),
        class_id INT,
        section_id INT,
        roll_number VARCHAR(20),
        admission_date DATE NOT NULL,
        status ENUM('active', 'inactive', 'graduated', 'transferred', 'dropped') DEFAULT 'active',
        profile_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
        INDEX idx_admission (admission_number),
        INDEX idx_class_section (class_id, section_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: students');

    // 5. Teachers table
    await connection.query(`
      CREATE TABLE teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        blood_group VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        phone VARCHAR(20) NOT NULL,
        emergency_contact VARCHAR(20),
        qualification VARCHAR(255),
        experience_years INT,
        specialization VARCHAR(255),
        joining_date DATE NOT NULL,
        salary DECIMAL(10, 2),
        status ENUM('active', 'inactive', 'resigned', 'retired') DEFAULT 'active',
        profile_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_employee (employee_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: teachers');

    // 6. Staff table
    await connection.query(`
      CREATE TABLE staff (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        blood_group VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        phone VARCHAR(20) NOT NULL,
        emergency_contact VARCHAR(20),
        designation VARCHAR(100),
        department VARCHAR(100),
        joining_date DATE NOT NULL,
        salary DECIMAL(10, 2),
        shift_timing VARCHAR(50),
        is_frontdesk BOOLEAN DEFAULT false,
        status ENUM('active', 'inactive', 'resigned', 'retired') DEFAULT 'active',
        profile_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_employee (employee_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: staff');

    // 7. Subjects table
    await connection.query(`
      CREATE TABLE subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: subjects');

    // 8. Class Subjects (junction table)
    await connection.query(`
      CREATE TABLE class_subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT,
        academic_year VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
        UNIQUE KEY unique_class_subject (class_id, subject_id, academic_year),
        INDEX idx_teacher (teacher_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: class_subjects');

    // 9. Timetable table
    await connection.query(`
      CREATE TABLE timetable (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        section_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        day_of_week ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room_number VARCHAR(50),
        academic_year VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        INDEX idx_class_section (class_id, section_id),
        INDEX idx_day (day_of_week)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: timetable');

    // 10. Attendance table
    await connection.query(`
      CREATE TABLE attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        section_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'half_day', 'excused') NOT NULL,
        remarks TEXT,
        marked_by INT,
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_attendance (student_id, date),
        INDEX idx_date (date),
        INDEX idx_class_section_date (class_id, section_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: attendance');

    // 11. Exams table
    await connection.query(`
      CREATE TABLE exams (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        exam_type ENUM('term', 'midterm', 'final', 'unit_test', 'monthly', 'quarterly', 'annual') NOT NULL,
        class_id INT NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_marks INT NOT NULL,
        passing_marks INT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_class_year (class_id, academic_year),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: exams');

    // 12. Exam Schedule table
    await connection.query(`
      CREATE TABLE exam_schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        exam_id INT NOT NULL,
        subject_id INT NOT NULL,
        exam_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room_number VARCHAR(50),
        max_marks INT NOT NULL,
        passing_marks INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        INDEX idx_exam_date (exam_id, exam_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: exam_schedule');

    // 13. Exam Results table
    await connection.query(`
      CREATE TABLE exam_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        exam_id INT NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        marks_obtained DECIMAL(5, 2) NOT NULL,
        max_marks INT NOT NULL,
        grade VARCHAR(10),
        remarks TEXT,
        entered_by INT,
        entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_result (exam_id, student_id, subject_id),
        INDEX idx_student (student_id),
        INDEX idx_exam (exam_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: exam_results');

    // 14. Assignments table
    await connection.query(`
      CREATE TABLE assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        class_id INT NOT NULL,
        section_id INT NOT NULL,
        subject_id INT NOT NULL,
        created_by INT NOT NULL,
        due_date DATE NOT NULL,
        total_marks INT DEFAULT 100,
        attachments JSON,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE CASCADE,
        INDEX idx_class_section (class_id, section_id),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: assignments');

    // 15. Assignment Submissions table
    await connection.query(`
      CREATE TABLE assignment_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_text TEXT,
        attachments JSON,
        marks_obtained DECIMAL(5, 2),
        feedback TEXT,
        status ENUM('submitted', 'late', 'graded', 'returned') DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP NULL,
        graded_by INT,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_submission (assignment_id, student_id),
        INDEX idx_student (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: assignment_submissions');

    // 16. Fee Heads table
    await connection.query(`
      CREATE TABLE fee_heads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: fee_heads');

    // 17. Fee Structure table
    await connection.query(`
      CREATE TABLE fee_structure (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        fee_head_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        period_type ENUM('monthly', 'one_time', 'semester', 'yearly', 'custom') NOT NULL DEFAULT 'monthly',
        period_value VARCHAR(50), -- Stores '1' to '12' for months, or 'Semester 1', etc.
        due_date DATE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (fee_head_id) REFERENCES fee_heads(id) ON DELETE CASCADE,
        INDEX idx_class_year (class_id, academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: fee_structure');

    // 18. Fee Payments table
    await connection.query(`
      CREATE TABLE fee_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        fee_structure_id INT NOT NULL,
        amount_paid DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method ENUM('cash', 'card', 'cheque', 'online', 'bank_transfer') NOT NULL,
        transaction_id VARCHAR(100),
        receipt_number VARCHAR(100) UNIQUE,
        remarks TEXT,
        collected_by INT,
        status ENUM('completed', 'pending', 'failed', 'refunded') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE CASCADE,
        FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_student (student_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_receipt (receipt_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: fee_payments');

    // 18. Payroll table
    await connection.query(`
      CREATE TABLE payroll (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_type ENUM('teacher', 'staff') NOT NULL,
        employee_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        basic_salary DECIMAL(10, 2) NOT NULL,
        allowances DECIMAL(10, 2) DEFAULT 0,
        deductions DECIMAL(10, 2) DEFAULT 0,
        net_salary DECIMAL(10, 2) NOT NULL,
        payment_date DATE,
        payment_method ENUM('cash', 'cheque', 'bank_transfer') NOT NULL,
        remarks TEXT,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        processed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_payroll (employee_type, employee_id, month, year),
        INDEX idx_employee (employee_type, employee_id),
        INDEX idx_month_year (month, year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: payroll');

    // 19. Events table
    await connection.query(`
      CREATE TABLE events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type ENUM('academic', 'sports', 'cultural', 'meeting', 'holiday', 'exam', 'parent_teacher', 'other') NOT NULL,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        target_audience ENUM('all', 'students', 'teachers', 'staff', 'parents', 'specific_class') DEFAULT 'all',
        is_holiday BOOLEAN DEFAULT false,
        created_by INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_date (event_date),
        INDEX idx_type (event_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: events');

    // 20. Announcements table
    await connection.query(`
      CREATE TABLE announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        target_audience ENUM('all', 'students', 'teachers', 'staff', 'parents', 'specific_class') DEFAULT 'all',
        class_id INT,
        section_id INT,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT true,
        created_by INT,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_priority (priority),
        INDEX idx_published (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: announcements');

    // 21. Notifications table
    await connection.query(`
      CREATE TABLE notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error', 'announcement') DEFAULT 'info',
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: notifications');

    // 22. Messages table
    await connection.query(`
      CREATE TABLE messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text TEXT NOT NULL,
        message_type ENUM('text', 'file', 'image') DEFAULT 'text',
        attachment_url VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_sender (sender_id),
        INDEX idx_receiver (receiver_id),
        INDEX idx_conversation (sender_id, receiver_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: messages');

    // 23. Visitors table
    await connection.query(`
      CREATE TABLE visitors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        visitor_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        purpose ENUM('parent_meeting', 'vendor', 'interview', 'official', 'guest', 'other') NOT NULL,
        purpose_details TEXT,
        person_to_meet VARCHAR(255),
        department VARCHAR(100),
        id_proof_type VARCHAR(50),
        id_proof_number VARCHAR(100),
        vehicle_number VARCHAR(50),
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out_time TIMESTAMP NULL,
        status ENUM('checked_in', 'checked_out') DEFAULT 'checked_in',
        remarks TEXT,
        registered_by INT,
        FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_date (check_in_time),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: visitors');

    // 24. Admissions table
    await connection.query(`
      CREATE TABLE admissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_number VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        class_applied_for INT NOT NULL,
        previous_school VARCHAR(255),
        parent_name VARCHAR(255) NOT NULL,
        parent_phone VARCHAR(20) NOT NULL,
        parent_email VARCHAR(255),
        address TEXT NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        status ENUM('pending', 'approved', 'rejected', 'admitted') DEFAULT 'pending',
        application_date DATE DEFAULT (CURDATE()),
        admission_date DATE,
        remarks TEXT,
        processed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_applied_for) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_application (application_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: admissions');

    // 25. Syllabus table
    await connection.query(`
      CREATE TABLE syllabus (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255),
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_class_subject (class_id, subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: syllabus');

    // 26. Study Materials table
    await connection.query(`
      CREATE TABLE study_materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        material_type ENUM('notes', 'video', 'pdf', 'link', 'other') NOT NULL,
        file_url VARCHAR(255),
        external_link VARCHAR(255),
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_class_subject (class_id, subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: study_materials');

    // 27. Library Books table
    await connection.query(`
      CREATE TABLE library_books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        isbn VARCHAR(50) UNIQUE,
        publisher VARCHAR(255),
        publication_year INT,
        category VARCHAR(100),
        total_copies INT DEFAULT 1,
        available_copies INT DEFAULT 1,
        rack_number VARCHAR(50),
        description TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_isbn (isbn),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: library_books');

    // 28. Library Transactions table
    await connection.query(`
      CREATE TABLE library_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_id INT NOT NULL,
        user_id INT NOT NULL,
        user_type ENUM('student', 'teacher', 'staff') NOT NULL,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE,
        fine_amount DECIMAL(10, 2) DEFAULT 0,
        status ENUM('issued', 'returned', 'overdue', 'lost') DEFAULT 'issued',
        remarks TEXT,
        issued_by INT,
        FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_dates (issue_date, due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: library_transactions');

    // 29. Transport Routes table
    await connection.query(`
      CREATE TABLE transport_routes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        route_name VARCHAR(255) NOT NULL,
        vehicle_number VARCHAR(50) NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        driver_phone VARCHAR(20) NOT NULL,
        route_stops JSON,
        start_time TIME,
        end_time TIME,
        monthly_fee DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: transport_routes');

    // 30. Student Transport table
    await connection.query(`
      CREATE TABLE student_transport (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        route_id INT NOT NULL,
        pickup_point VARCHAR(255),
        drop_point VARCHAR(255),
        academic_year VARCHAR(20),
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_route (route_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: student_transport');

    console.log('\n✅ All tables created successfully!\n');

    // Insert default data
    console.log('📝 Inserting default data...\n');

    // 1. Create super admin user
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD || 'Admin@123',
      10
    );

    await connection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [process.env.SUPER_ADMIN_EMAIL || 'admin@gyan.edu', hashedPassword, 'super_admin']
    );
    console.log('✅ Super admin user created');

    // 2. Insert sample classes
    const classData = [
      ['Class 1', 1, 'First grade', '2024-2025'],
      ['Class 2', 2, 'Second grade', '2024-2025'],
      ['Class 3', 3, 'Third grade', '2024-2025'],
      ['Class 4', 4, 'Fourth grade', '2024-2025'],
      ['Class 5', 5, 'Fifth grade', '2024-2025'],
      ['Class 6', 6, 'Sixth grade', '2024-2025'],
      ['Class 7', 7, 'Seventh grade', '2024-2025'],
      ['Class 8', 8, 'Eighth grade', '2024-2025'],
      ['Class 9', 9, 'Ninth grade', '2024-2025'],
      ['Class 10', 10, 'Tenth grade', '2024-2025']
    ];

    await connection.query(
      'INSERT INTO classes (name, grade_level, description, academic_year) VALUES ?',
      [classData]
    );
    console.log('✅ Sample classes inserted');

    // 3. Insert sample sections
    const sectionData = [
      ['A', 1, null, 40],
      ['B', 1, null, 40],
      ['A', 2, null, 40],
      ['B', 2, null, 40],
      ['A', 3, null, 40],
      ['B', 3, null, 40]
    ];

    await connection.query(
      'INSERT INTO sections (name, class_id, class_teacher_id, capacity) VALUES ?',
      [sectionData]
    );
    console.log('✅ Sample sections inserted');

    // 4. Insert sample subjects
    const subjectData = [
      ['Mathematics', 'MATH', 'Mathematics and numerical skills'],
      ['Science', 'SCI', 'Scientific concepts and experiments'],
      ['English', 'ENG', 'English language and literature'],
      ['Social Studies', 'SOC', 'History, geography, and civics'],
      ['Hindi', 'HIN', 'Hindi language'],
      ['Computer Science', 'CS', 'Computer basics and programming'],
      ['Physical Education', 'PE', 'Sports and physical activities'],
      ['Art', 'ART', 'Drawing and creative arts'],
      ['Music', 'MUS', 'Music and singing']
    ];

    await connection.query(
      'INSERT INTO subjects (name, code, description) VALUES ?',
      [subjectData]
    );
    console.log('✅ Sample subjects inserted');

    console.log('\n🎉 Database migration completed successfully!\n');
    console.log('📧 Super Admin Credentials:');
    console.log(`   Email: ${process.env.SUPER_ADMIN_EMAIL || 'admin@gyan.edu'}`);
    console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\n⚠️  IMPORTANT: Change these credentials in production!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed\n');
    }
  }
};

// Run migration
migrate();
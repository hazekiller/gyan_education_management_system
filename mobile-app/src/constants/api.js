// API Configuration
// Update this to your backend server IP address when testing on physical device
// For Android Emulator: use 10.0.2.2
// For iOS Simulator: use localhost
// For Physical Device: use your computer's IP address (e.g., 192.168.1.x)

export const API_BASE_URL = __DEV__
    ? 'http://192.168.1.80:5002/api'  // Updated to your local IP for physical device
    : 'https://your-production-api.com/api';

export const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',

    // Users
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',

    // Students
    STUDENTS: '/students',
    STUDENT_DETAILS: (id) => `/students/${id}`,

    // Teachers
    TEACHERS: '/teachers',
    TEACHER_DETAILS: (id) => `/teachers/${id}`,

    // Classes
    CLASSES: '/classes',
    CLASS_DETAILS: (id) => `/classes/${id}`,

    // Subjects
    SUBJECTS: '/subjects',

    // Attendance
    ATTENDANCE: '/attendance',
    MARK_ATTENDANCE: '/attendance/mark',

    // Exams
    EXAMS: '/exams',
    EXAM_DETAILS: (id) => `/exams/${id}`,
    EXAM_RESULTS: (id) => `/exams/${id}/results`,

    // Assignments
    ASSIGNMENTS: '/assignments',
    ASSIGNMENT_DETAILS: (id) => `/assignments/${id}`,
    SUBMIT_ASSIGNMENT: (id) => `/assignments/${id}/submit`,

    // Fees
    FEES: '/fees',
    FEE_RECORDS: '/fees/records',
    PAY_FEE: '/fees/pay',

    // Events
    EVENTS: '/events',

    // Announcements
    ANNOUNCEMENTS: '/announcements',
    ANNOUNCEMENT_DETAILS: (id) => `/announcements/${id}`,

    // Messages
    MESSAGES: '/messages',
    SEND_MESSAGE: '/messages/send',

    // Schedule
    SCHEDULE: '/schedule',
    SCHEDULE_DETAILS: (id) => `/schedule/${id}`,

    // Library
    LIBRARY_BOOKS: '/library/books',
    LIBRARY_TRANSACTIONS: '/library/transactions',
    ISSUE_BOOK: '/library/issue',
    RETURN_BOOK: '/library/return',

    // Library
    LIBRARY_BOOKS: '/library/books',
    LIBRARY_BOOK_DETAILS: (id) => `/library/books/${id}`,
    LIBRARY_TRANSACTIONS: '/library/transactions',
    LIBRARY_MY_BOOKS: '/library/my-books',
    LIBRARY_ISSUE: '/library/issue',
    LIBRARY_RETURN: '/library/return',

    // Hostel
    HOSTEL_ROOMS: '/hostel/rooms',
    HOSTEL_DETAILS: (id) => `/hostel/rooms/${id}`,
    HOSTEL_ALLOCATIONS: '/hostel/allocations',
    HOSTEL_MY_ROOM: '/hostel/my-room',

    // Transport
    TRANSPORT_ROUTES: '/transport/routes',
    TRANSPORT_VEHICLES: '/transport/vehicles',
    TRANSPORT_MY_TRANSPORT: '/transport/my-transport',

    // Staff
    STAFF: '/staff',
    STAFF_DETAILS: (id) => `/staff/${id}`,

    // Payroll
    PAYROLL: '/payroll',
    PAYROLL_DETAILS: (id) => `/payroll/${id}`,

    // Admissions
    ADMISSIONS: '/admissions',
    ADMISSION_DETAILS: (id) => `/admissions/${id}`,

    // Daily Reports
    DAILY_REPORTS: '/daily-reports',
    DAILY_REPORT_DETAILS: (id) => `/daily-reports/${id}`,
};

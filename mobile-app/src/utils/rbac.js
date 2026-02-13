// Role-based Access Control Utility for Mobile App
// Consistent with backend/config/permissions.js and web implementation

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    PRINCIPAL: 'principal',
    VICE_PRINCIPAL: 'vice_principal',
    HOD: 'hod',
    TEACHER: 'teacher',
    STUDENT: 'student',
    ACCOUNTANT: 'accountant',
    GUARD: 'guard',
    CLEANER: 'cleaner',
    HR: 'hr',
    STAFF: 'staff',
};

// Define screen access by role
// This mapping determines which drawer items are visible
export const SCREEN_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['*'], // Access to everything
    
    [ROLES.PRINCIPAL]: [
        'Dashboard', 'Admissions', 'DailyReports', 'Classes', 'Subjects', 'Students', 'Teachers', 'Staff', 
        'Attendance', 'Exams', 'Assignments', 'Fees', 'Events', 
        'Announcements', 'Messages', 'Schedule', 'Library', 
        'Hostel', 'Transport', 'Payroll', 'Profile'
    ],

    [ROLES.TEACHER]: [
        'Dashboard', 'DailyReports', 'Classes', 'Subjects', 'Students', 'Attendance', 
        'Exams', 'Assignments', 'Events', 'Announcements', 'Messages', 
        'Schedule', 'Library', 'Profile'
    ],

    [ROLES.STUDENT]: [
        'Dashboard', 'Classes', 'Subjects', 'Attendance', 'Exams', 'Assignments', 
        'Fees', 'Events', 'Announcements', 'Messages', 'Schedule', 
        'Library', 'Hostel', 'Transport', 'Profile'
    ],

    [ROLES.ACCOUNTANT]: [
        'Dashboard', 'Students', 'Fees', 'Payroll', 'Events', 
        'Announcements', 'Messages', 'Profile'
    ],

    [ROLES.GUARD]: [
        'Dashboard', 'Events', 'Announcements', 'Messages', 'Profile'
    ],
    
    [ROLES.HR]: [
        'Dashboard', 'Teachers', 'Staff', 'Attendance', 'Payroll', 
        'Events', 'Announcements', 'Messages', 'Profile'
    ],
};

/**
 * Check if a role can access a specific screen
 * @param {string} role - User role
 * @param {string} screenName - Name of the screen/stack
 * @returns {boolean}
 */
export const canAccessScreen = (role, screenName) => {
    if (!role) return false;
    
    const permissions = SCREEN_PERMISSIONS[role] || [];
    
    if (permissions.includes('*')) return true;
    
    return permissions.includes(screenName);
};

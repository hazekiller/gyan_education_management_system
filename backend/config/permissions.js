// backend/config/permissions.js
// Role-based permissions system

const PERMISSIONS = {
  // Super Admin - Full access to everything
  super_admin: {
    users: ['create', 'read', 'update', 'delete'],
    students: ['create', 'read', 'update', 'delete'],
    teachers: ['create', 'read', 'update', 'delete'],
    staff: ['create', 'read', 'update', 'delete'],
    classes: ['create', 'read', 'update', 'delete'],
    class_subjects: ['create', 'read', 'update', 'delete'],
    subjects: ['create', 'read', 'update', 'delete'],
    exams: ['create', 'read', 'update', 'delete'],
    assignments: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    fees: ['create', 'read', 'update', 'delete'],
    payroll: ['create', 'read', 'update', 'delete'],
    library: ['create', 'read', 'update', 'delete'],
    events: ['create', 'read', 'update', 'delete'],
    announcements: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    admissions: ['create', 'read', 'update', 'delete'],
    visitors: ['create', 'read', 'update', 'delete'],
    leaves: ['create', 'read', 'update', 'delete'], // Added
  },

  // Principal - Almost full access
  principal: {
    users: ['create', 'read', 'update'],
    students: ['create', 'read', 'update', 'delete'],
    teachers: ['create', 'read', 'update', 'delete'],
    staff: ['create', 'read', 'update', 'delete'],
    classes: ['create', 'read', 'update', 'delete'],
    class_subjects: ['create', 'read', 'update', 'delete'],
    subjects: ['create', 'read', 'update', 'delete'],
    exams: ['create', 'read', 'update', 'delete'],
    assignments: ['read'],
    attendance: ['read', 'update'],
    fees: ['create', 'read', 'update'],
    payroll: ['create', 'read', 'update', 'delete'],
    library: ['create', 'read', 'update', 'delete'],
    events: ['create', 'read', 'update', 'delete'],
    announcements: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read'],
    settings: ['read', 'update'],
    dashboard: ['read'],
    admissions: ['create', 'read', 'update', 'delete'],
    visitors: ['read', 'update'],
    leaves: ['create', 'read', 'update', 'delete'], // Added
  },

  // Vice Principal
  vice_principal: {
    users: ['read'],
    students: ['create', 'read', 'update'],
    teachers: ['read', 'update'],
    staff: ['read', 'update'],
    classes: ['create', 'read', 'update'],
    class_subjects: ['create', 'read', 'update', 'delete'],
    subjects: ['create', 'read', 'update'],
    exams: ['create', 'read', 'update'],
    assignments: ['read'],
    attendance: ['read', 'update'],
    fees: ['read', 'update'],
    payroll: ['read'],
    library: ['create', 'read', 'update'],
    events: ['create', 'read', 'update', 'delete'],
    announcements: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['create', 'read', 'update'],
    visitors: ['read', 'update'],
    leaves: ['create', 'read', 'update', 'delete'], // Added
  },

  // HOD (Head of Department)
  hod: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read', 'update'],
    class_subjects: ['read', 'update', 'delete'],
    subjects: ['read', 'update'],
    exams: ['create', 'read', 'update'],
    assignments: ['read'],
    attendance: ['read', 'update'],
    fees: ['read'],
    payroll: ['read'],
    library: ['read'],
    events: ['create', 'read', 'update'],
    announcements: ['create', 'read', 'update'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
    visitors: ['read'],
    leaves: ['create', 'read', 'update'], // Added
  },

  // Teacher
  teacher: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read'],
    class_subjects: ['read'],
    subjects: ['read'],
    exams: ['create', 'read', 'update'],
    assignments: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update'],
    fees: ['read'],
    payroll: ['read'],
    library: ['read'],
    events: ['read'],
    announcements: ['read'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
    visitors: ['read'],
  },

  // Accountant
  accountant: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read'],
    class_subjects: ['read'],
    subjects: ['read'],
    exams: ['read'],
    assignments: ['read'],
    attendance: ['read'],
    fees: ['create', 'read', 'update', 'delete'],
    payroll: ['create', 'read', 'update', 'delete'],
    library: ['read'],
    events: ['read'],
    announcements: ['read'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
    visitors: ['read'],
  },

  // Guard
  guard: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read'],
    class_subjects: ['read'],
    subjects: ['read'],
    exams: ['read'],
    assignments: ['read'],
    attendance: ['read'],
    fees: ['read'],
    payroll: ['read'],
    library: ['read'],
    events: ['read'],
    announcements: ['read'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
    visitors: ['create', 'read', 'update', 'delete'],
  },

  // Cleaner
  cleaner: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read'],
    class_subjects: ['read'],
    subjects: ['read'],
    exams: ['read'],
    assignments: ['read'],
    attendance: ['read'],
    fees: ['read'],
    payroll: ['read'],
    library: ['read'],
    events: ['read'],
    announcements: ['read'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
  },

  // Student
  student: {
    users: ['read'],
    students: ['read'],
    teachers: ['read'],
    staff: ['read'],
    classes: ['read'],
    class_subjects: ['read'],
    subjects: ['read'],
    exams: ['read'],
    assignments: ['read', 'update'],
    attendance: ['read'],
    fees: ['read'],
    payroll: [],
    library: ['read'],
    transport: ['read'], // Students can view their own transport info
    hostel: ['read'], // Students can view their own hostel info
    events: ['read'],
    announcements: ['read'],
    messages: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    settings: ['read'],
    dashboard: ['read'],
    admissions: ['read'],
    visitors: ['read'],
  },
};

/**
 * Check if a role has permission for a specific resource and action
 * @param {string} role - User role
 * @param {string} resource - Resource name (e.g., 'students', 'teachers')
 * @param {string} action - Action to perform ('create', 'read', 'update', 'delete')
 * @returns {boolean} - True if permission granted
 */
function hasPermission(role, resource, action) {
  // Check if role exists
  if (!PERMISSIONS[role]) {
    console.log(`❌ Role not found: ${role}`);
    return false;
  }

  // Check if resource exists for this role
  if (!PERMISSIONS[role][resource]) {
    console.log(`❌ Resource not found for role ${role}: ${resource}`);
    return false;
  }

  // Check if action is allowed
  const hasAccess = PERMISSIONS[role][resource].includes(action);

  if (!hasAccess) {
    console.log(`❌ Permission denied: ${role} cannot ${action} ${resource}`);
  }

  return hasAccess;
}

/**
 * Get all permissions for a specific role
 * @param {string} role - User role
 * @returns {object} - All permissions for the role
 */
function getRolePermissions(role) {
  return PERMISSIONS[role] || {};
}

/**
 * Check if user can access a resource (any action)
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @returns {boolean} - True if user has any access to resource
 */
function canAccess(role, resource) {
  if (!PERMISSIONS[role] || !PERMISSIONS[role][resource]) {
    return false;
  }
  return PERMISSIONS[role][resource].length > 0;
}

module.exports = {
  PERMISSIONS,
  hasPermission,
  getRolePermissions,
  canAccess,
};

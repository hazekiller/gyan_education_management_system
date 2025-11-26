import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.clear();
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// ============================================
// STUDENTS API
// ============================================
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/students/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/students/${id}`),
  getAttendance: (id, params) => api.get(`/students/${id}/attendance`, { params }),
  getResults: (id, params) => api.get(`/students/${id}/results`, { params }),
};


// ============================================
// TEACHERS API
// ============================================
export const teachersAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/teachers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/teachers/${id}`),
  getSchedule: (id, params) => api.get(`/teachers/${id}/schedule`, { params }),
};

// SUBJECTS API
// ============================================
export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ============================================
// CLASSES API
// ============================================
export const classesAPI = {
  // Class Management
  getAll: (params) => api.get("/classes", { params }),
  getMyClasses: () => api.get("/classes/my-classes"), // Get teacher's assigned classes
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),

  // Class Teacher Management (Legacy - kept for backward compatibility)
  assignTeacher: (classId, teacherId) =>
    api.put(`/classes/${classId}/assign-teacher`, { teacher_id: teacherId }),
  removeTeacher: (classId) => api.delete(`/classes/${classId}/remove-teacher`),

  // Section Management
  getSections: (classId) => api.get(`/classes/${classId}/sections`),
  getMySections: (classId) => api.get(`/classes/${classId}/my-sections`), // Get teacher's assigned sections
  getSectionById: (sectionId) => api.get(`/classes/sections/${sectionId}`),
  createSection: (classId, data) =>
    api.post(`/classes/${classId}/sections`, data),
  updateSection: (sectionId, data) =>
    api.put(`/classes/sections/${sectionId}`, data),
  deleteSection: (sectionId) => api.delete(`/classes/sections/${sectionId}`),
  getSectionStudents: (sectionId) =>
    api.get(`/classes/sections/${sectionId}/students`),

  // Section Class Teacher Management (Homeroom Teacher)
  assignSectionTeacher: (sectionId, teacherId) =>
    api.put(`/classes/sections/${sectionId}/assign-teacher`, {
      teacher_id: teacherId,
    }),
  removeSectionTeacher: (sectionId) =>
    api.delete(`/classes/sections/${sectionId}/remove-teacher`),

  // Section Subject Teachers Management
  getSectionSubjectTeachers: (sectionId) =>
    api.get(`/classes/sections/${sectionId}/subject-teachers`),
  assignSectionSubjectTeacher: (sectionId, data) =>
    api.post(`/classes/sections/${sectionId}/subject-teachers`, data),
  updateSectionSubjectTeacher: (assignmentId, data) =>
    api.put(`/classes/section-subject-teachers/${assignmentId}`, data),
  removeSectionSubjectTeacher: (assignmentId) =>
    api.delete(`/classes/section-subject-teachers/${assignmentId}`),

 // ============================================
  // CLASS SUBJECTS MANAGEMENT (NEW)
  // ============================================
  
  /**
   * Get all subjects assigned to a class
   * @param {number} classId - The class ID
   * @param {object} params - Query parameters (academic_year, is_active)
   */
  getClassSubjects: (classId, params) => 
    api.get(`/class-subjects/class/${classId}`, { params }),
  
  /**
   * Get subjects available for assignment (not yet assigned to class)
   * @param {number} classId - The class ID
   * @param {object} params - Query parameters (academic_year)
   */
  getAvailableSubjects: (classId, params) => 
    api.get(`/class-subjects/available/${classId}`, { params }),
  
  /**
   * Assign a single subject to a class
   * @param {object} data - { class_id, subject_id, teacher_id?, academic_year? }
   */
  assignSubjectToClass: (data) => 
    api.post('/class-subjects/assign', data),
  
  /**
   * Assign multiple subjects to a class at once
   * @param {object} data - { class_id, subjects: [{ subject_id, teacher_id? }], academic_year? }
   */
  assignMultipleSubjects: (data) => 
    api.post('/class-subjects/assign-multiple', data),
  
  /**
   * Update a class subject assignment (change teacher, status, etc.)
   * @param {number} assignmentId - The class_subjects assignment ID
   * @param {object} data - { teacher_id?, is_active? }
   */
  updateClassSubject: (assignmentId, data) => 
    api.put(`/class-subjects/${assignmentId}`, data),
  
  /**
   * Remove a subject from a class
   * @param {number} assignmentId - The class_subjects assignment ID
   */
  removeSubjectFromClass: (assignmentId) => 
    api.delete(`/class-subjects/${assignmentId}`),
  
  /**
   * Get subjects for a specific section (with section-specific teachers)
   * @param {number} sectionId - The section ID
   * @param {object} params - Query parameters (academic_year)
   */
  getSectionSubjects: (sectionId, params) => 
    api.get(`/class-subjects/section/${sectionId}`, { params }),
  
  /**
   * Assign a teacher to a section-subject (overrides class default)
   * @param {object} data - { section_id, subject_id, teacher_id, academic_year? }
   */
  assignTeacherToSectionSubject: (data) => 
    api.post('/class-subjects/section-teacher', data),
};





// ============================================
// ATTENDANCE API
// ============================================
export const attendanceAPI = {
  mark: (data) => api.post("/attendance", data),
  get: (params) => api.get("/attendance", { params }),
  checkSubmission: (params) =>
    api.get("/attendance/check-submission", { params }), // New: Check if submitted
  submit: (data) => api.post("/attendance/submit", data), // New: Submit attendance
  unlock: (data) => api.post("/attendance/unlock", data), // New: Unlock attendance (admin only)
};

// ============================================
// EXAMS API
// ============================================
export const examsAPI = {
  create: (data) => api.post("/exams", data),
  getAll: (params) => api.get("/exams", { params }),
  getById: (id) => api.get(`/exams/${id}`),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  enterResults: (data) => api.post("/exam-results", data),
};

// ============================================
// ASSIGNMENTS API
// ============================================
export const assignmentsAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && data[key]) {
        Array.from(data[key]).forEach(file => {
          formData.append('attachments', file);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: (params) => api.get('/assignments', { params }),
};

// ============================================
// FEE MANAGEMENT API
// ============================================
export const feeAPI = {
  recordPayment: (data) => api.post('/fee-payments', data),
  getPayments: (params) => api.get('/fee-payments', { params }),
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  create: (data) => api.post('/events', data),
  getAll: (params) => api.get('/events', { params }),
};

// ============================================
// ANNOUNCEMENTS API
// ============================================
export const announcementsAPI = {
  create: (data) => api.post('/announcements', data),
  getAll: () => api.get('/announcements'),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentRegistrations: (limit = 5) =>
    api.get("/dashboard/recent-registrations", { params: { limit } }),
};

export default api;

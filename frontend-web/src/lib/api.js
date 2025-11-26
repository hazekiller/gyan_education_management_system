// src/api/api.js

import axios from "axios";

// BASE URL (global)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR (Attach Token)
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR (Handle 401)
// ============================================
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Helper Function for FormData
const toFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === "attachments" && Array.isArray(data[key])) {
        data[key].forEach((file) => formData.append("attachments", file));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};



// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  changePassword: (data) => api.put("/auth/change-password", data),
  logout: () => api.post("/auth/logout"),
};


// ============================================
// STUDENT API
// ============================================
export const studentsAPI = {
  getAll: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),

  create: (data) =>
    api.post("/students", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, data) =>
    api.put(`/students/${id}`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/students/${id}`),

  getAttendance: (id, params) =>
    api.get(`/students/${id}/attendance`, { params }),

  getResults: (id, params) =>
    api.get(`/students/${id}/results`, { params }),
};


// ============================================
// TEACHERS API
// ============================================
export const teachersAPI = {
  getAll: (params) => api.get("/teachers", { params }),
  getById: (id) => api.get(`/teachers/${id}`),

  create: (data) =>
    api.post("/teachers", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, data) =>
    api.put(`/teachers/${id}`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/teachers/${id}`),

   // ==============================
  // TEACHER SCHEDULE ENDPOINTS
  // ==============================
  getSchedule: (id, params) => api.get(`/teachers/${id}/schedule`, { params }),
  getScheduleDetail: (periodId) => api.get(`/teachers/my-schedule/${periodId}`),
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
  getSections: (classId) => api.get(`/classes/${classId}/sections`),
  getMySections: (classId) => api.get(`/classes/${classId}/my-sections`),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),

  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
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
    api.get("/attendance/check-submission", { params }),
  submit: (data) => api.post("/attendance/submit", data),
  unlock: (data) => api.post("/attendance/unlock", data),
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
  create: (data) =>
    api.post("/assignments", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAll: (params) => api.get("/assignments", { params }),
};


// ============================================
// FEE MANAGEMENT API
// ============================================
export const feeAPI = {
  recordPayment: (data) => api.post("/fee-payments", data),
  getPayments: (params) => api.get("/fee-payments", { params }),
};


// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
  create: (data) => api.post("/events", data),
  getAll: (params) => api.get("/events", { params }),
};


// ============================================
// ANNOUNCEMENTS API
// ============================================
export const announcementsAPI = {
  // ==============================
  // BASIC CRUD OPERATIONS
  // ==============================
  
  /**
   * Get all announcements with optional filters
   * @param {object} params - Query parameters (status, priority, target_audience, class_id, section_id)
   */
  getAll: (params) => api.get("/announcements", { params }),
  
  /**
   * Get announcement by ID
   * @param {number} id - Announcement ID
   */
  getById: (id) => api.get(`/announcements/${id}`),
  
  /**
   * Create a new announcement
   * @param {object} data - { title, content, priority?, target_audience?, class_id?, section_id?, expires_at?, is_active?, published_at? }
   */
  create: (data) => api.post("/announcements", data),
  
  /**
   * Update an announcement
   * @param {number} id - Announcement ID
   * @param {object} data - Fields to update
   */
  update: (id, data) => api.put(`/announcements/${id}`, data),
  
  /**
   * Delete an announcement
   * @param {number} id - Announcement ID
   */
  delete: (id) => api.delete(`/announcements/${id}`),

  // ==============================
  // USER-SPECIFIC ANNOUNCEMENTS
  // ==============================
  
  /**
   * Get announcements for logged-in user (role-based filtering)
   * - Admins see all active announcements
   * - Teachers see announcements for teachers + their classes/sections
   * - Students see announcements for students + their class/section
   * - Parents see announcements for parents + their children's classes/sections
   */
  getMyAnnouncements: () => api.get("/announcements/my-announcements"),
  
  /**
   * Get announcements created by the logged-in user
   */
  getMyCreated: () => api.get("/announcements/my-created"),

  // ==============================
  // FILTERED ANNOUNCEMENTS
  // ==============================
  
  /**
   * Get urgent priority announcements only
   */
  getUrgent: () => api.get("/announcements/urgent"),
  
  /**
   * Get announcements for a specific class
   * @param {number} classId - Class ID
   */
  getByClass: (classId) => api.get(`/announcements/class/${classId}`),
  
  /**
   * Get announcements for a specific section
   * @param {number} sectionId - Section ID
   */
  getBySection: (sectionId) => api.get(`/announcements/section/${sectionId}`),

  // ==============================
  // STATUS MANAGEMENT
  // ==============================
  
  /**
   * Toggle announcement active status (activate/deactivate)
   * @param {number} id - Announcement ID
   */
  toggleStatus: (id) => api.patch(`/announcements/${id}/toggle-status`),
  
  /**
   * Publish an announcement (sets published_at to now and activates it)
   * @param {number} id - Announcement ID
   */
  publish: (id) => api.patch(`/announcements/${id}/publish`),

  // ==============================
  // CONVENIENCE METHODS
  // ==============================
  
  /**
   * Get active announcements only
   */
  getActive: () => api.get("/announcements", { params: { status: "active" } }),
  
  /**
   * Get expired announcements
   */
  getExpired: () => api.get("/announcements", { params: { status: "expired" } }),
  
  /**
   * Get inactive announcements
   */
  getInactive: () => api.get("/announcements", { params: { status: "inactive" } }),
  
  /**
   * Get announcements by target audience
   * @param {string} audience - Target audience (all, students, teachers, parents, staff)
   */
  getByAudience: (audience) => api.get("/announcements", { params: { target_audience: audience } }),
  
  /**
   * Get announcements by priority
   * @param {string} priority - Priority level (low, normal, urgent)
   */
  getByPriority: (priority) => api.get("/announcements", { params: { priority } }),
};


// ============================================
// DASHBOARD API
// ============================================
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentRegistrations: (limit = 5) =>
    api.get("/dashboard/recent-registrations", { params: { limit } }),
};

// Final export
export default api;
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

// ============================================
// CLASSES API
// ============================================
export const classesAPI = {
  getAll: (params) => api.get("/classes", { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getSections: (classId) => api.get(`/classes/${classId}/sections`),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),
  assignTeacher: (classId, teacherId) =>
    api.put(`/classes/${classId}/assign-teacher`, { teacher_id: teacherId }),
  removeTeacher: (classId) => api.delete(`/classes/${classId}/remove-teacher`),
};



// ============================================
// ATTENDANCE API
// ============================================
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  get: (params) => api.get('/attendance', { params }),
};

// ============================================
// EXAMS API
// ============================================
export const examsAPI = {
  create: (data) => api.post('/exams', data),
  getAll: (params) => api.get('/exams', { params }),
  enterResults: (data) => api.post('/exam-results', data),
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

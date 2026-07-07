// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Do not attach tokens by default in simplified local auth
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        // forward mock headers for backend convenience
        if (user.id) {
          config.headers['x-mock-user-id'] = user.id;
          if (user.role) config.headers['x-mock-user-role'] = user.role;
          console.log('API Request:', config.url, '| Hospital ID:', user.id);
        }
      } catch (_) {}
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not force navigation to /login on 401 — keep local dev flow simple.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // keep user info for manual flow; frontend routing will handle protected routes
      // Optionally, you can emit an event here to show a toast or trigger UI changes.
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Donor APIs
export const donorAPI = {
  getDashboard: () => api.get('/donor/dashboard'),
  getEmergencyRequests: () => api.get('/donor/emergency-requests'),
  respondToRequest: (requestId, data) => api.post(`/donor/respond/${requestId}`, data),
  getDonationHistory: () => api.get('/donor/history'),
  scheduleDonation: (data) => api.post('/donor/schedule-donation', data),
  getAchievements: () => api.get('/donor/achievements'),
  getStats: () => api.get('/donor/stats'),
  getNotifications: () => api.get('/donor/notifications'),
  markNotificationRead: (notificationId) => api.put(`/donor/notifications/${notificationId}/read`),
  getNearbyBloodBanks: (params) => api.get('/donor/nearby/bloodbanks', params ? { params } : undefined),
  getNearbyHospitals: (params) => api.get('/donor/nearby/hospitals', params ? { params } : undefined)
};

// Hospital APIs
export const hospitalAPI = {
  getDashboard: () => api.get('/hospital/dashboard'),
  createBloodRequest: (data) => api.post('/hospital/request', data),
  getBloodRequests: () => api.get('/hospital/requests'),
  getBloodInventory: () => api.get('/hospital/inventory'),
  // aliases used by App.js
  getRequests: () => api.get('/hospital/requests'),
  getInventory: () => api.get('/hospital/inventory'),
  getStats: () => api.get('/hospital/stats')
};

// Blood Bank APIs
export const bloodBankAPI = {
  getDashboard: () => api.get('/bloodbank/dashboard'),
  // per-bloodbank inventory (me)
  getInventory: () => api.get('/bloodbank/inventory/me'),
  updateInventory: (bloodType, data) => api.put(`/bloodbank/inventory/${bloodType}`, data),
  getPendingDonors: () => api.get('/bloodbank/pending-donors'),
  approveDonation: (donationId, data) => api.put(`/bloodbank/donation/${donationId}/approve`, data),
  getHospitalRequests: () => api.get('/bloodbank/hospital-requests'),
  processRequest: (requestId, data) => api.put(`/bloodbank/request/${requestId}/process`, data),
  getRecentDonations: () => api.get('/bloodbank/donations'),
  searchDonors: (query) => api.get('/bloodbank/donors/search', { params: { query } }),
  recordDonation: (data) => api.post('/bloodbank/donations/record', data),
  getEligibleDonors: () => api.get('/bloodbank/eligible-donors'),
  sendReminder: (donorId) => api.post('/bloodbank/send-reminder', { donorId }),
  scheduleAppointment: (donorId, appointmentDate) => api.post('/bloodbank/schedule-appointment', { donorId, appointmentDate }),
  getAppointments: () => api.get('/bloodbank/appointments'),
  markDonationDone: (donationId) => api.get(`/bloodbank/appointments/${donationId}/mark-done`),
  // Campaign/Event management
  getMyEvents: () => api.get('/bloodbank/campaigns/my-events'),
  createEvent: (formData) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('eventDate', formData.eventDate);
    data.append('eventTime', formData.eventTime);
    data.append('location', formData.location);
    data.append('contactInfo', formData.contactInfo);
    data.append('requirements', formData.requirements);
    data.append('creatorType', 'bloodbank'); // Explicitly set creator type
    if (formData.image) {
      data.append('image', formData.image);
    }
    return api.post('/bloodbank/campaigns/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateEvent: (eventId, formData) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('eventDate', formData.eventDate);
    data.append('eventTime', formData.eventTime);
    data.append('location', formData.location);
    data.append('contactInfo', formData.contactInfo);
    data.append('requirements', formData.requirements);
    data.append('creatorType', 'bloodbank'); // Explicitly set creator type
    if (formData.image) {
      data.append('image', formData.image);
    }
    return api.put(`/bloodbank/campaigns/${eventId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteEvent: (eventId) => api.delete(`/bloodbank/campaigns/${eventId}`),
  getEventRegistrations: (eventId) => api.get(`/bloodbank/campaigns/${eventId}/registrations`),
  exportRegistrations: (eventId) => api.get(`/bloodbank/campaigns/${eventId}/export`, {
    responseType: 'arraybuffer'
  })
};

export default api;

// ========================================
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    config.headers['x-mock-user-id'] = user.id;
    config.headers['x-mock-user-role'] = user.role;
  }
  return config;
});

// Event API functions
export const eventAPI = {
  // Public routes
  getAllEvents: (status) => {
    const params = status ? { status } : {};
    return api.get('/events', { params });
  },

  getEvent: (id) => {
    return api.get(`/events/${id}`);
  },

  registerForEvent: (eventId, registrationData) => {
    return api.post(`/events/${eventId}/register`, registrationData);
  },

  // Hospital routes
  getMyEvents: () => {
    return api.get('/events/hospital/my-events');
  },

  createEvent: (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.post('/events/hospital/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateEvent: (id, eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined) {
        formData.append(key, eventData[key]);
      }
    });
    return api.put(`/events/hospital/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteEvent: (id) => {
    return api.delete(`/events/hospital/${id}`);
  },

  getEventRegistrations: (eventId) => {
    return api.get(`/events/hospital/${eventId}/registrations`);
  },

  exportRegistrations: (eventId) => {
    return api.get(`/events/hospital/${eventId}/export`, {
      responseType: 'blob'
    });
  }
};

export default eventAPI;


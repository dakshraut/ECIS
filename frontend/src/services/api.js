import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
  },
};

// AI Integration endpoints
export const crimeService = {
  analyzeLocation: (latitude, longitude) =>
    api.post('/analyze-location', {
      latitude,
      longitude,
    }),

  runTimeMachine: (latitude, longitude, years = 5) =>
    api.post('/time-machine', {
      latitude,
      longitude,
      years,
    }),

  getNearbyHotspots: (lat, lon, radius = 100) =>
    api.get('/hotspots/nearby', {
      params: { lat, lon, radius_km: radius },
    }),

  submitReport: (reportData) =>
    api.post('/reports/submit', reportData),

  getRegionInfo: (lat, lon) =>
    api.get('/region/info', {
      params: { lat, lon },
    }),

  detectCrime: (latitude, longitude, locationName, address) =>
    api.post('/ai-integration/detect', {
      latitude,
      longitude,
      location_name: locationName,
      address,
    }),
  
  batchDetectCrimes: (locations) =>
    api.post('/ai-integration/batch-detect', { locations }),
  
  getHotspots: () =>
    api.get('/hotspots'),
  
  getStats: () =>
    api.get('/stats'),
  
  getReports: () =>
    api.get('/reports'),
  
  checkHealth: () =>
    api.get('/ai-integration/health'),
};

export const analyzeLocation = async (latitude, longitude) => {
  const response = await api.post('/analyze-location', {
    latitude,
    longitude,
  });
  return response.data;
};

export const runTimeMachine = async (latitude, longitude, years = 5) => {
  const response = await api.post('/time-machine', {
    latitude,
    longitude,
    years,
  });
  return response.data;
};

export const getNearbyHotspots = async (lat, lon, radius = 100) => {
  const response = await api.get('/hotspots/nearby', {
    params: { lat, lon, radius_km: radius },
  });
  return response.data;
};

export const submitReport = async (reportData) => {
  const response = await api.post('/reports/submit', reportData);
  return response.data;
};

export const getRegionInfo = async (lat, lon) => {
  const response = await api.get('/region/info', {
    params: { lat, lon },
  });
  return response.data;
};

// Violations endpoints
export const violationService = {
  getViolations: (filters = {}) =>
    api.get('/violations', { params: filters }),
  
  getViolation: (id) =>
    api.get(`/violations/${id}`),
  
  createViolation: (data) =>
    api.post('/violations', data),
  
  getAnalytics: () =>
    api.get('/violations/analytics'),
};

export { api };
export default api;

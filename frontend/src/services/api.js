import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_GEO_API_BASE_URL = 'http://localhost:5000/api/v1';
const FALLBACK_API_BASE_URLS = [
  'http://localhost:5001/api',
  'http://127.0.0.1:5000/api',
  'http://127.0.0.1:5001/api',
];

const resolveApiBaseUrl = async () => {
  const preferred = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
  const candidateUrls = [preferred, ...FALLBACK_API_BASE_URLS.filter((url) => url !== preferred)];

  for (const url of candidateUrls) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 1500 });
      if (response?.status === 200) {
        return url;
      }
    } catch {
      // Continue to the next candidate.
    }
  }

  return preferred;
};

let apiBaseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
let geoApiBaseUrl = import.meta.env.VITE_GEO_API_URL || `${apiBaseUrl.replace(/\/$/, '')}/v1`;

const createApiClient = (baseURL) => axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = createApiClient(apiBaseUrl);
const geoApi = createApiClient(geoApiBaseUrl);

const updateClients = (baseURL) => {
  api.defaults.baseURL = baseURL;
  geoApi.defaults.baseURL = import.meta.env.VITE_GEO_API_URL || `${baseURL.replace(/\/$/, '')}/v1`;
};

resolveApiBaseUrl().then((resolvedBaseUrl) => {
  apiBaseUrl = resolvedBaseUrl;
  geoApiBaseUrl = import.meta.env.VITE_GEO_API_URL || `${resolvedBaseUrl.replace(/\/$/, '')}/v1`;
  updateClients(resolvedBaseUrl);
}).catch(() => {
  api.defaults.baseURL = DEFAULT_API_BASE_URL;
  geoApi.defaults.baseURL = import.meta.env.VITE_GEO_API_URL || DEFAULT_GEO_API_BASE_URL;
});

// Add token to requests
const attachAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuthToken);
geoApi.interceptors.request.use(attachAuthToken);

// Handle response errors
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  handleAuthError
);

geoApi.interceptors.response.use(
  (response) => response,
  handleAuthError
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
    geoApi.post('/analyze-location', {
      latitude,
      longitude,
    }),

  runTimeMachine: (latitude, longitude, years = 5) =>
    geoApi.post('/time-machine', {
      latitude,
      longitude,
      years,
    }),

  getNearbyHotspots: (lat, lon, radius = 100) =>
    geoApi.get('/hotspots/nearby', {
      params: { lat, lon, radius_km: radius },
    }),

  submitReport: (reportData) =>
    geoApi.post('/reports/submit', reportData),

  getRegionInfo: (lat, lon) =>
    geoApi.get('/region/info', {
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
    geoApi.get('/hotspots'),
  
  getStats: () =>
    geoApi.get('/stats'),
  
  getReports: () =>
    geoApi.get('/reports'),
  
  checkHealth: () =>
    api.get('/ai-integration/health'),
};

export const analyzeLocation = async (latitude, longitude) => {
  const response = await geoApi.post('/analyze-location', {
    latitude,
    longitude,
  });
  return response.data;
};

export const runTimeMachine = async (latitude, longitude, years = 5) => {
  const response = await geoApi.post('/time-machine', {
    latitude,
    longitude,
    years,
  });
  return response.data;
};

export const getNearbyHotspots = async (lat, lon, radius = 100) => {
  const response = await geoApi.get('/hotspots/nearby', {
    params: { lat, lon, radius_km: radius },
  });
  return response.data;
};

export const submitReport = async (reportData) => {
  const response = await geoApi.post('/reports/submit', reportData);
  return response.data;
};

export const getRegionInfo = async (lat, lon) => {
  const response = await geoApi.get('/region/info', {
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

export { api, geoApi };
export default api;

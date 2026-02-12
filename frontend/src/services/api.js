import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.detail?.error 
      || error.response?.data?.detail 
      || error.message 
      || 'An unexpected error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 403) {
      console.error('API Quota exceeded or forbidden');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    
    return Promise.reject({ message: errorMessage, status: error.response?.status });
  }
);

// API Functions
export const fetchTrends = async (niche = null, customKeyword = null) => {
  const payload = customKeyword 
    ? { custom_keyword: customKeyword }
    : { niche };
  
  const response = await api.post('/trends', payload);
  return response.data;
};

export const analyzeVideo = async (videoId, niche) => {
  const response = await api.post('/analyse', {
    video_id: videoId,
    niche: niche,
  });
  return response.data;
};

export const analyzeChannel = async (channelUrl, competitorUrl = null) => {
  const payload = { channel_url: channelUrl };
  if (competitorUrl) {
    payload.competitor_url = competitorUrl;
  }
  
  const response = await api.post('/channel-analyse', payload);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const copilotChat = async (message) => {
  const response = await api.post('/copilot-chat', { message });
  return response.data;
};

export default api;

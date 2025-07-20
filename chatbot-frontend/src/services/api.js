import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-chat-assistant-0mim.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    console.log(`🚀 API Request [${timestamp}]:`, config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`✅ API Response [${timestamp}]:`, response.status, response.config.url);
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ API Response Error [${timestamp}]:`, {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (message, sessionId = null) => {
    const response = await api.post('/chat/message', { message, sessionId });
    return response.data;
  },

  getChatHistory: async (sessionId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/history/${sessionId}`, {
      params: { page, limit }
    });
    return response.data;
  }
};

export default api;

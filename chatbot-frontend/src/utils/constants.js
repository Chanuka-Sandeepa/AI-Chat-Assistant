export const API_ENDPOINTS = {
  SEND_MESSAGE: '/chat/message',
  GET_HISTORY: '/chat/history',
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot'
};

export const ANIMATION_DELAYS = {
  TYPING_MIN: 500,
  TYPING_MAX: 1000,
  TYPING_PER_CHAR: 20
};

export const LIMITS = {
  MESSAGE_MAX_LENGTH: 2000,
  HISTORY_PAGE_SIZE: 50,
  REQUEST_TIMEOUT: 30000
};

export const STORAGE_KEYS = {
  SESSION_ID: 'chatbot_session_id',
  USER_PREFERENCES: 'chatbot_preferences'
};

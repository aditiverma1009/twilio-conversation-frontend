export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const API_ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`, // for now
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  },
  
  // Twilio routes
  TWILIO: {
    TOKEN: `${API_BASE_URL}/twilio/token`, // for now
  },
  
  // Conversation routes
  CONVERSATIONS: {
    LIST: `${API_BASE_URL}/conversations`, // for now paginated
    DETAIL: (id: string) => `${API_BASE_URL}/conversations/${id}`,
    PARTICIPANTS: (id: string) => `${API_BASE_URL}/conversations/${id}/participants`, // good to have
    CREATE: `${API_BASE_URL}/conversations`,
    UPDATE: (id: string) => `${API_BASE_URL}/conversations/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/conversations/${id}`,
  },
  
  // User routes
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
  },
} as const;
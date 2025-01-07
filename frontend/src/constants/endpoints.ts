const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  TASKS: `${API_BASE_URL}/tasks`,
  USERS: `${API_BASE_URL}/users`,
  PROTECTED: `${API_BASE_URL}/protected`,
  UPLOAD:`${API_BASE_URL}/upload`,
  ROLES: `${API_BASE_URL}/roles`,
  PERMISSIONS: `${API_BASE_URL}/roles/permissions`,

};

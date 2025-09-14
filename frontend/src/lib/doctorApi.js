import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with default config
const doctorApi = axios.create({
  baseURL: `${API_BASE_URL}/api/doctor`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
doctorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
doctorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctorInfo');
      window.location.href = '/doctor-verify';
    }
    return Promise.reject(error);
  }
);

// Doctor API functions
export const getDoctorStats = async () => {
  try {
    const response = await doctorApi.get('/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDoctorProfile = async () => {
  try {
    const response = await doctorApi.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    throw error;
  }
};

export const updateDoctorProfile = async (profileData) => {
  try {
    const response = await doctorApi.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw error;
  }
};

export default doctorApi;

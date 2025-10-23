import axios from 'axios';
import { User, UserCreate, Token, Habit, HabitCreate } from '../types';

const API_BASE_URL = '/api';

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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  login: async (email: string, password: string): Promise<Token> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/users/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

export const habitsAPI = {
  getHabits: async (): Promise<Habit[]> => {
    const response = await api.get('/habits/');
    return response.data;
  },

  createHabit: async (habitData: HabitCreate): Promise<Habit> => {
    const response = await api.post('/habits/', habitData);
    return response.data;
  },

  deleteHabit: async (habitId: number): Promise<void> => {
    await api.delete(`/habits/${habitId}`);
  },
};

export default api;

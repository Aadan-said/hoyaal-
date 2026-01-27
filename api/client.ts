import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// For development, use your machine IP instead of localhost if testing on physical device
const API_URL = 'https://api.hoyaal.so/v1';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Mocking function - will replace with actual API calls later
export const mockFetch = async <T>(data: T, delay = 1000): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};

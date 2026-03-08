import axios from 'axios';
// Create an Axios instance with base URL and credentials enabled
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Crucial for sending and receiving httpOnly cookies
});
// Optionally, you can add response interceptors for global error handling
api.interceptors.response.use((response) => response, (error) => {
    // If we get a 401 Unauthorized, we might want to redirect to login or show a toast
    if (error.response?.status === 401) {
        console.warn('Unauthorized request. User might be logged out.');
        // Handle session expiration here if needed
    }
    return Promise.reject(error);
});

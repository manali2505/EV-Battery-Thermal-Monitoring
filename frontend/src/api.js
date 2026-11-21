
import axios from "axios";

// Create a common Axios instance for backend communication
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080"
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

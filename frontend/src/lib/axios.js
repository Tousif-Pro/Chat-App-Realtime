import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5002/api"
    : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api",
  withCredentials: true,
});

console.log("Base URL:", import.meta.env.MODE === "development" ? "http://localhost:5002/api" : "https://chat-app-realtime-2.onrender.com/api");

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5002/api/users');
    console.log(response.data); // This will log the user data
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

fetchUsers();

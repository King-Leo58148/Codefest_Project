import axios from "axios";
import BASE_URL from "./config";

const api = axios.create({ baseURL: BASE_URL });

// Attach admin token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
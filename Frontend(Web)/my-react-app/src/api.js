import axios from "axios";
import BASE_URL from "./config";

const api = axios.create({ baseURL: BASE_URL });

// Attach admin token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accesstoken");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
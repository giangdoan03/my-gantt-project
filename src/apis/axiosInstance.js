import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost/codeigniter-app/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm withCredentials để gửi cookie
axiosInstance.defaults.withCredentials = true;

// Thêm token vào header Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Thêm token vào header Authorization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

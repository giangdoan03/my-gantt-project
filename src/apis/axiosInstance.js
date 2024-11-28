import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost/codeigniter-app/api", // URL backend của bạn
  timeout: 10000, // Thời gian timeout
  headers: {
    "Content-Type": "application/json", // Header yêu cầu JSON
  },
  withCredentials: true, // Kích hoạt credentials (cookie)
});

export default axiosInstance;

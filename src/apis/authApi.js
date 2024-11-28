import axiosInstance from "./axiosInstance";

export async function handleLogin(email, password) {
  try {
    const response = await axiosInstance.post("/login", { email, password });
    const token = response.data.token;
    console.log("Login Success:", token);
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    if (error.response) {
    //   console.error("Login Failed:", error.response.data.message);
      throw error.response; // Ném lỗi để xử lý ở `methods`
    } else {
      console.error("Network Error:", error.message);
      throw error; // Ném lỗi để xử lý ở `methods`
    }
  }
}

export async function handleLogout() {
    try {
        const response = await axiosInstance.post("/logout"); // Gọi API logout
        return response.data; // Trả về phản hồi từ backend
    } catch (error) {
        throw error.response?.data || error.message; // Xử lý lỗi
    }
}

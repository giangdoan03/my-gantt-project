import axiosInstance from "./axiosInstance";

export async function handleLogin(email, password) {
    const response = await axiosInstance.post("/login", { email, password });
    if (response.data.status) {
        return response.data; // Trả về dữ liệu thành công
    } else {
        throw new Error(response.data.message || "Đăng nhập thất bại");
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

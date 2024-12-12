import axiosInstance from "./axiosInstance";

// Lấy danh sách người dùng
export async function fetchUsers() {
	try {
		const response = await axiosInstance.get("/users");
		return response.data; // Trả về danh sách người dùng
	} catch (error) {
		console.error("Failed to fetch users:", error.response?.data || error.message);
		throw error.response?.data || error.message; // Ném lỗi để xử lý
	}
}

// Lấy danh sách người dùng đã được định dạng
export async function fetchFormattedUsers() {
	try {
		const response = await axiosInstance.get("/users/formatted");
		return response.data; // Trả về danh sách người dùng đã định dạng
	} catch (error) {
		console.error("Failed to fetch formatted users:", error.response?.data || error.message);
		throw error.response?.data || error.message; // Ném lỗi để xử lý
	}
}

// Xóa người dùng
export const deleteUser = async (userId) => {
	try {
		const response = await axiosInstance.delete(`/users/${userId}`);
		return response;
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
};


// Thêm người dùng mới
export async function createUser(userData) {
	try {
		const response = await axiosInstance.post("/users", userData);
		console.log("User created:", userData);
		return response.data; // Trả về phản hồi từ API
	} catch (error) {
		console.error("Failed to create user:", error.response?.data || error.message);
		throw error.response?.data || error.message;
	}
}

// Chỉnh sửa người dùng
export async function updateUser(userId, userData) {
	try {
		const response = await axiosInstance.put(`/users/${userId}`, userData);
		return response.data; // Trả về phản hồi từ API
	} catch (error) {
		console.error("Failed to update user:", error.response?.data || error.message);
		throw error.response?.data || error.message;
	}
}

export async function getUserById(userId) {
	return await axiosInstance.get(`/users/${userId}`);
}

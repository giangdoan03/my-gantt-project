import axiosInstance from "./axiosInstance";

// Lấy danh sách vai trò
export async function fetchRoles() {
  try {
    const response = await axiosInstance.get("/roles");
    return response.data; // Trả về dữ liệu vai trò
  } catch (error) {
    console.error("Failed to fetch roles:", error.response?.data || error.message);
    throw error.response?.data || error.message; // Ném lỗi để xử lý
  }
}

// Xóa vai trò
export async function deleteRole(roleId) {
  try {
    const response = await axiosInstance.delete(`/roles/${roleId}`);
    return response.data; // Trả về phản hồi từ API
  } catch (error) {
    console.error("Failed to delete role:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
}

// Thêm vai trò mới
export async function createRole(roleData) {
  try {
    const response = await axiosInstance.post("/roles", roleData);
    return response.data; // Trả về phản hồi từ API
  } catch (error) {
    console.error("Failed to create role:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
}

// Chỉnh sửa vai trò
export async function updateRole(roleId, roleData) {
  try {
    const response = await axiosInstance.put(`/roles/${roleId}`, roleData);
    return response.data; // Trả về phản hồi từ API
  } catch (error) {
    console.error("Failed to update role:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
}

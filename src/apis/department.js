import axiosInstance from "./axiosInstance";

// Lấy danh sách phòng ban
export async function fetchDepartments() {
    try {
        const response = await axiosInstance.get("/departments");
        return response.data; // Trả về danh sách phòng ban
    } catch (error) {
        console.error("Failed to fetch departments:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Lấy danh sách phòng ban theo định dạng
export async function fetchFormattedDepartments() {
    try {
        const response = await axiosInstance.get("/departments_format");
        return response.data; // Trả về danh sách phòng ban đã định dạng
    } catch (error) {
        console.error("Failed to fetch formatted departments:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Lấy chi tiết phòng ban
export async function fetchDepartmentDetails(departmentId) {
    try {
        const response = await axiosInstance.get(`/departments/${departmentId}`);
        return response.data; // Trả về thông tin chi tiết phòng ban
    } catch (error) {
        console.error("Failed to fetch department details:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Thêm phòng ban mới
export async function createDepartment(departmentData) {
    try {
        const response = await axiosInstance.post("/departments", departmentData);
        return response.data; // Trả về thông tin phòng ban mới tạo
    } catch (error) {
        console.error("Failed to create department:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Cập nhật thông tin phòng ban
export async function updateDepartment(departmentId, departmentData) {
    try {
        const response = await axiosInstance.put(`/departments/${departmentId}`, departmentData);
        return response.data; // Trả về thông tin phòng ban sau khi cập nhật
    } catch (error) {
        console.error("Failed to update department:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Xóa phòng ban
export async function deleteDepartment(departmentId) {
    try {
        const response = await axiosInstance.delete(`/departments/${departmentId}`);
        return response.data; // Trả về phản hồi khi xóa thành công
    } catch (error) {
        console.error("Failed to delete department:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

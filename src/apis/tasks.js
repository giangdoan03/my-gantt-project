import axiosInstance from "./axiosInstance";

// Thêm task mới
export async function createTask(taskData) {
    try {
        const response = await axiosInstance.post("/tasks/add", taskData);

        console.log("taskData", taskData); // Log dữ liệu task gửi lên
        return response.data; // Trả về phản hồi từ API
    } catch (error) {
        console.error(
            "Failed to create task:",
            error.response?.data || error.message
        );
        throw error.response?.data || error.message; // Ném lỗi để xử lý phía gọi hàm
    }
}

// Cập nhật task
export async function updateTask(taskId, taskData) {
    try {
        const response = await axiosInstance.put(`/tasks/update/${taskId}`, taskData);

        console.log("Updated task data", taskData); // Log dữ liệu task gửi lên
        return response.data; // Trả về phản hồi từ API
    } catch (error) {
        console.error(
            "Failed to update task:",
            error.response?.data || error.message
        );
        throw error.response?.data || error.message; // Ném lỗi để xử lý phía gọi hàm
    }
}

// Xóa task
export async function deleteTask(taskId) {
    try {
        const response = await axiosInstance.delete(`/tasks/delete/${taskId}`);

        console.log(`Task with ID ${taskId} deleted`); // Log thông tin task đã xóa
        return response.data; // Trả về phản hồi từ API
    } catch (error) {
        console.error(
            "Failed to delete task:",
            error.response?.data || error.message
        );
        throw error.response?.data || error.message; // Ném lỗi để xử lý phía gọi hàm
    }
}


export async function getTasks() {
    const response = await axiosInstance.get("/tasks");
    return response.data.data;
}

// Lấy chi tiết task
export async function getTaskDetails(taskId) {
    try {
        const response = await axiosInstance.get(`/tasks/${taskId}`);
        return response.data; // Trả về dữ liệu hợp đồng
    } catch (error) {
        console.error("Failed to fetch contract details:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

export async function getResources() {
    const response = await axiosInstance.get("/resources");
    return response.data;
}

export async function getPriorities() {
    const response = await axiosInstance.get("/priorities");
    return response.data.data.map((priority) => ({
        key: parseInt(priority.priority_key, 10), // Chuyển thành số nguyên
        label: priority.label,
    }));
}

export async function getOwners() {
    const response = await axiosInstance.get("/owners");
    return response.data.data.map((owner) => ({
        key: parseInt(owner.owner_key, 10), // Chuyển thành số nguyên
        label: owner.label,
    }));
}

export async function getDepartments() {
    const response = await axiosInstance.get("/departments");
    return response.data.map((department) => ({
        key: parseInt(department.id, 10), // Chuyển thành số nguyên
        label: department.short_name,
    }));
}






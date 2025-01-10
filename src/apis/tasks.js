import axiosInstance from "./axiosInstance";

// Thêm task mới
export async function createTask(taskData) {
    try {
        const response = await axiosInstance.post("/tasks/add", taskData);

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
        const response = await axiosInstance.post(`/tasks/update/${taskId}`, taskData);
        return response.data; // Trả về phản hồi từ API
    } catch (error) {
        console.error(
            "Failed to update task:",
            error.response?.data || error.message
        );
        throw error.response?.data || error.message; // Ném lỗi để xử lý phía gọi hàm
    }
}

// Cập nhật thứ tự task
export async function saveTaskOrder(taskData) {
    try {
        const response = await axiosInstance.post(`/tasks/update-order`, taskData);
        return response.data; // Trả về phản hồi từ API
    } catch (error) {
        console.error("Failed to update task order:", error.response?.data || error.message);
        // Ném lỗi chi tiết để xử lý phía gọi hàm
        throw error.response?.data || { message: error.message, status: error.response?.status };
    }
}


// Cập nhật trạng thái cho các task
export async function updateTasksStatus(taskIds, isTemporary) {
    try {
        // Gửi yêu cầu API để cập nhật trạng thái của các task
        const response = await axiosInstance.post('/tasks/update-tasks-status', {
            taskIds: taskIds,      // Danh sách task IDs
            isTemporary: isTemporary  // Trạng thái cần cập nhật (1 hoặc 0)
        });

        // Trả về phản hồi từ API
        return response.data;
    } catch (error) {
        console.error(
            "Failed to update tasks status:",
            error.response?.data || error.message
        );
        // Ném lỗi để xử lý phía gọi hàm
        throw error.response?.data || error.message;
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


export async function getOfficialTasks(contractId) {
    const response = await axiosInstance.get(`/tasks/official/${contractId}`);
    return response.data.data;
}

export async function getTemporaryTasks() {
    const response = await axiosInstance.get("/tasks/temporary");
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

// Lấy chi tiết task
export async function getTaskTemporaryDetails(taskId) {
    try {
        const response = await axiosInstance.get(`/task-temporary/${taskId}`);
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






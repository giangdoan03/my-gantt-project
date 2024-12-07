import axiosInstance from "./axiosInstance";

// Lấy danh sách hợp đồng
export async function fetchContracts() {
    try {
        const response = await axiosInstance.get("/contracts");
        return response.data; // Trả về dữ liệu
    } catch (error) {
        console.error("Failed to fetch contracts:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Lấy chi tiết hợp đồng
export async function fetchContractDetails(contractId) {
    try {
        const response = await axiosInstance.get(`/contracts/${contractId}`);
        return response.data; // Trả về dữ liệu hợp đồng
    } catch (error) {
        console.error("Failed to fetch contract details:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Thêm hợp đồng mới
export async function createContract(contractData) {
    try {
        const response = await axiosInstance.post("/contracts", contractData);
        return response.data;
    } catch (error) {
        console.error("Failed to create contract:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Cập nhật hợp đồng
export async function updateContract(contractId, contractData) {
    try {
        const response = await axiosInstance.put(`/contracts/${contractId}`, contractData);
        return response.data;
    } catch (error) {
        console.error("Failed to update contract:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Xóa hợp đồng
export async function deleteContract(contractId) {
    try {
        const response = await axiosInstance.delete(`/contracts/${contractId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete contract:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

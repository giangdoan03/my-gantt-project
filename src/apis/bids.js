import axiosInstance from "./axiosInstance";

// Lấy danh sách gói thầu
export async function fetchBids() {
    try {
        const response = await axiosInstance.get("/bids");
        return response.data; // Trả về dữ liệu
    } catch (error) {
        console.error("Failed to fetch bids:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Lấy chi tiết một gói thầu
export async function fetchBidDetail(id) {
    try {
        const response = await axiosInstance.get(`/bids/${id}`);
        return response.data; // Trả về dữ liệu
    } catch (error) {
        console.error("Failed to fetch bid detail:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Thêm mới gói thầu
export async function createBid(bidData) {
    try {
        const response = await axiosInstance.post("/bids", bidData);
        return response.data; // Trả về dữ liệu sau khi thêm
    } catch (error) {
        console.error("Failed to create bid:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Sửa gói thầu
export async function updateBid(id, bidData) {
    try {
        const response = await axiosInstance.put(`/bids/${id}`, bidData);
        return response.data; // Trả về dữ liệu sau khi sửa
    } catch (error) {
        console.error("Failed to update bid:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Xóa gói thầu
export async function deleteBid(id) {
    try {
        const response = await axiosInstance.delete(`/bids/${id}`);
        return response.data; // Trả về dữ liệu sau khi xóa
    } catch (error) {
        console.error("Failed to delete bid:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

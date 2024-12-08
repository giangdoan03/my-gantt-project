import axiosInstance from "./axiosInstance";

// Lấy danh sách khách hàng
export async function fetchCustomers() {
    try {
        const response = await axiosInstance.get("/customers");
        return response.data; // Trả về dữ liệu khách hàng
    } catch (error) {
        console.error("Failed to fetch customers:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Lấy chi tiết khách hàng
export async function fetchCustomerById(customerId) {
    try {
        const response = await axiosInstance.get(`/customers/${customerId}`);
        return response.data; // Trả về thông tin chi tiết của khách hàng
    } catch (error) {
        console.error(`Failed to fetch customer with ID ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Thêm khách hàng
export async function createCustomer(customerData) {
    try {
        const response = await axiosInstance.post("/customers", customerData);
        return response.data; // Trả về kết quả sau khi thêm khách hàng
    } catch (error) {
        console.error("Failed to create customer:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Cập nhật khách hàng
export async function updateCustomer(customerId, customerData) {
    try {
        const response = await axiosInstance.put(`/customers/${customerId}`, customerData);
        return response.data; // Trả về kết quả sau khi cập nhật khách hàng
    } catch (error) {
        console.error(`Failed to update customer with ID ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

// Xóa khách hàng
export async function deleteCustomer(customerId) {
    try {
        const response = await axiosInstance.delete(`/customers/${customerId}`);
        return response.data; // Trả về kết quả sau khi xóa khách hàng
    } catch (error) {
        console.error(`Failed to delete customer with ID ${customerId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}

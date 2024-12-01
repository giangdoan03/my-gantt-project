export function formatDateToVietnameseDateOnly(dateObject) {
    try {
        // Kiểm tra nếu là đối tượng Date
        if (dateObject instanceof Date) {
            return dateObject.toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh", // Đảm bảo sử dụng múi giờ Việt Nam
            });
        }

        console.error("Invalid Date object:", dateObject);
        return "N/A";
    } catch (error) {
        console.error("Error in formatting date:", error);
        return "N/A";
    }
}

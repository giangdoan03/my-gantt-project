<template>
    <div>
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard!</p>
        <a-button type="primary" @click="logout">Logout</a-button>
    </div>
</template>

<script>
// import { useAuthStore } from "@/stores/authStore";
import { handleLogout } from "@/apis/authApi";
import { message } from "ant-design-vue";

export default {
    name: "DashboardPage",
    methods: {
        async logout() {
            try {
                await handleLogout(); // Gọi API logout
                localStorage.removeItem("auth_token"); // Xóa token khỏi localStorage

                // Hiển thị thông báo thành công
                message.success("Bạn đã đăng xuất khỏi hệ thống!");

                // Điều hướng về trang login
                this.$router.push("/");
            } catch (error) {
                console.error("Logout failed:", error);

                // Hiển thị thông báo lỗi nếu có
                message.error("Đăng xuất thất bại! Vui lòng thử lại.");
            }
        },
    },
};
</script>
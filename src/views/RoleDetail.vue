<template>
    <div class="role-detail">
        <!-- Tiêu đề và nút quay lại -->
        <div class="header">
            <h2>Chi Tiết Vai Trò</h2>
            <a-button type="default" @click="$router.push({ name: 'RolesList' })">
                ← Quay lại danh sách vai trò
            </a-button>
        </div>

        <!-- Hiển thị chi tiết vai trò -->
        <a-card title="Thông Tin Vai Trò" class="info-card" v-if="role">
            <a-descriptions bordered :column="1">
                <a-descriptions-item label="ID">{{ role.id }}</a-descriptions-item>
                <a-descriptions-item label="Tên Vai Trò">{{ role.role_name }}</a-descriptions-item>
                <a-descriptions-item label="Mô Tả">{{ role.description }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Tạo">{{ role.created_at }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Cập Nhật">{{ role.updated_at }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <!-- Hiển thị thông báo đang tải -->
        <a-spin v-else style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            Đang tải thông tin vai trò...
        </a-spin>
    </div>
</template>

<script>
import { fetchRoleDetail } from "@/apis/roles"; // API để lấy chi tiết vai trò

export default {
    name: "RoleDetail",
    data() {
        return {
            role: null, // Chi tiết vai trò
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    async mounted() {
        const roleId = this.$route.params.id; // Lấy ID vai trò từ URL
        await this.loadRoleDetail(roleId); // Tải chi tiết vai trò
    },
    methods: {
        async loadRoleDetail(id) {
            this.loading = true;
            try {
                const response = await fetchRoleDetail(id); // Gọi API lấy dữ liệu vai trò
                this.role = response.data; // Lưu chi tiết vai trò
            } catch (error) {
                console.error("Lỗi khi tải thông tin vai trò:", error);
                this.$message.error("Không thể tải thông tin vai trò.");
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.role-detail {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.info-card {
    margin-top: 20px;
}
</style>

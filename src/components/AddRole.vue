<template>
    <div class="add-role">
        <h2>{{ isEdit ? "Chỉnh sửa Vai Trò" : "Thêm Vai Trò Mới" }}</h2>
        <a-form @submit.prevent="handleSubmit" label-col="{ span: 4 }" wrapper-col="{ span: 16 }">
            <!-- Tên vai trò -->
            <a-form-item label="Tên vai trò" :rules="[{ required: true, message: 'Tên vai trò không được để trống' }]">
                <a-input v-model="role.role_name" placeholder="Nhập tên vai trò" :disabled="isEdit" />
            </a-form-item>

            <!-- Mô tả vai trò -->
            <a-form-item label="Mô tả vai trò">
                <a-input.TextArea v-model="role.description" placeholder="Nhập mô tả vai trò" rows="4" />
            </a-form-item>

            <!-- Nút hành động -->
            <a-form-item wrapper-col="{ offset: 4, span: 16 }">
                <a-button type="primary" html-type="submit">
                    {{ isEdit ? "Cập nhật" : "Thêm mới" }}
                </a-button>
                <a-button @click="$router.push('/roles')" style="margin-left: 10px">
                    Hủy
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { createRole, updateRole, fetchRoles } from "@/apis/roles";

export default {
    name: "AddRole",
    data() {
        return {
            role: {
                role_name: "",
                description: "",
            },
        };
    },
    computed: {
        isEdit() {
            return !!this.$route.params.id; // Kiểm tra xem có ID không (Chế độ chỉnh sửa)
        },
    },
    methods: {
        async handleSubmit() {
            try {
                if (this.isEdit) {
                    await updateRole(this.$route.params.id, this.role); // Gọi API updateRole
                    this.$message.success("Cập nhật vai trò thành công!");
                } else {
                    await createRole(this.role); // Gọi API createRole
                    this.$message.success("Thêm vai trò thành công!");
                }
                this.$router.push("/roles"); // Quay lại danh sách vai trò
            } catch (error) {
                console.error("Lỗi khi xử lý vai trò:", error);
                this.$message.error("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        },
    },
    async mounted() {
        if (this.isEdit) {
            try {
                const response = await fetchRoles(); // Lấy vai trò để chỉnh sửa
                const roles = response.data; // API trả về danh sách vai trò
                this.role = roles.find((role) => role.id === this.$route.params.id); // Lấy vai trò cần chỉnh sửa
            } catch (error) {
                this.$message.error("Không thể tải thông tin vai trò.");
            }
        }
    },
};
</script>

<style scoped>
.add-role {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-role h2 {
    margin-bottom: 20px;
}
</style>
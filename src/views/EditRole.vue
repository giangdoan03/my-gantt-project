<template>
    <div>
        <h1>{{ isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới" }}</h1>
        <a-form @submit.prevent="handleSubmit">
            <a-form-item label="Tên vai trò">
                <a-input v-model="role.name" placeholder="Nhập tên vai trò" />
            </a-form-item>
            <a-form-item label="Mô tả vai trò">
                <a-input.TextArea v-model="role.description" placeholder="Nhập mô tả vai trò" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit">
                    {{ isEdit ? "Cập nhật" : "Thêm mới" }}
                </a-button>
                <a-button @click="$router.push('/roles')" style="margin-left: 8px">
                    Hủy
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { createRole, updateRole, fetchRoles } from "@/apis/roles";

export default {
    data() {
        return {
            role: {
                name: "",
                description: "",
            },
        };
    },
    computed: {
        isEdit() {
            return !!this.$route.params.id;
        },
    },
    methods: {
        async fetchRole() {
            const { id } = this.$route.params;
            if (this.isEdit) {
                try {
                    const role = await fetchRoles(id); // Sử dụng fetchRoles API
                    this.role = role;
                } catch (error) {
                    this.$message.error("Không thể tải vai trò. Vui lòng thử lại.");
                }
            }
        },
        async handleSubmit() {
            try {
                if (this.isEdit) {
                    // Gọi API updateRole
                    await updateRole(this.$route.params.id, this.role);
                    this.$message.success("Vai trò đã được cập nhật!");
                } else {
                    // Gọi API createRole
                    await createRole(this.role);
                    this.$message.success("Vai trò đã được thêm mới!");
                }
                this.$router.push("/roles");
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
                this.$message.error(errorMessage);
            }
        },
    },
    mounted() {
        if (this.isEdit) {
            this.fetchRole();
        }
    },
};
</script>

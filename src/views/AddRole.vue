<template>
    <div>
        <h1>{{ isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới" }}</h1>
        <a-form @submit.prevent="handleSubmit">
            <a-form-item label="Tên vai trò">
                <a-input v-model:value="role.role_name" placeholder="Nhập tên vai trò" />
            </a-form-item>
            <a-form-item label="Mô tả vai trò">
                <a-textarea v-model:value="role.description" placeholder="Nhập mô tả vai trò" />
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
import { getRoleById, createRole, updateRole } from "@/apis/roles";

export default {
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
            return !!this.$route.params.id;
        },
    },
    methods: {
        async fetchRole() {
            try {
                if (this.isEdit) {
                    const { id } = this.$route.params;
                    const response = await getRoleById(id);
                    this.role = response.data.data; // Assuming data contains 'role'
                }
            } catch (error) {
                this.$message.error("Không thể tải thông tin vai trò.");
            }
        },
        async handleSubmit() {
            try {
                if (this.isEdit) {
                    const { id } = this.$route.params;
                    await updateRole(id, this.role);
                    this.$message.success("Vai trò đã được cập nhật!");
                } else {
                    console.log('roleData', this.role);
                    await createRole(this.role);

                    this.$message.success("Vai trò đã được thêm mới!");
                }
                this.$router.push("/dashboard/roles");
            } catch (error) {
                this.$message.error("Có lỗi xảy ra. Vui lòng thử lại.");
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
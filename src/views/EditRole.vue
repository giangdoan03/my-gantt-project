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
import axios from "axios";

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
                const response = await axios.get(
                    `http://localhost/codeigniter-app/api/roles/${id}`
                );
                this.role = response.data;
            }
        },
        async handleSubmit() {
            try {
                if (this.isEdit) {
                    await axios.put(
                        `http://localhost/codeigniter-app/api/roles/${this.$route.params.id}`,
                        this.role
                    );
                    this.$message.success("Vai trò đã được cập nhật!");
                } else {
                    await axios.post(
                        "http://localhost/codeigniter-app/api/roles",
                        this.role
                    );
                    this.$message.success("Vai trò đã được thêm mới!");
                }
                this.$router.push("/roles");
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
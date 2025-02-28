<template>
    <div class="user-form-container">
        <h1 class="form-title">{{ isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới" }}</h1>
        <a-form @submit.prevent="handleSubmit" layout="vertical" class="custom-form" :model="user" :rules="formRules">
            <!-- Tên người dùng -->
            <a-form-item label="Tên người dùng" name="name">
                <a-input v-model:value="user.name" placeholder="Nhập tên người dùng" class="custom-input"/>
            </a-form-item>

            <!-- Email -->
            <a-form-item label="Email" name="email"
                         :rules="[{ type: 'email', required: true, message: 'Vui lòng nhập email hợp lệ!' }]">
                <a-input type="email" v-model:value="user.email" placeholder="Nhập email" class="custom-input"/>
            </a-form-item>

            <!-- Mật khẩu -->
            <a-form-item label="Mật khẩu" name="password"
                         :rules="!isEdit ? [{ required: true, message: 'Vui lòng nhập mật khẩu!' }] : []">
                <a-input type="password" v-model:value="user.password"
                         :placeholder="isEdit ? 'Để trống nếu không muốn thay đổi' : 'Nhập mật khẩu'"
                         class="custom-input"/>
            </a-form-item>

            <!-- Vai trò -->
            <a-form-item label="Vai trò" name="role" :rules="[{ required: true, message: 'Vui lòng chọn vai trò!' }]">
                <a-select v-model:value="user.role" placeholder="Chọn vai trò" class="custom-select">
                    <a-select-option value="admin">Admin</a-select-option>
                    <a-select-option value="manager">Manager</a-select-option>
                    <a-select-option value="staff">Staff</a-select-option>
                </a-select>
            </a-form-item>

            <!-- Avatar -->
            <a-form-item label="Ảnh đại diện" name="avatar">
                <input type="file" @change="handleFileChange" accept="image/*" />
                <img v-if="previewImage || user.avatar" :src="avatarUrl" alt="Avatar preview" class="avatar-preview" />
            </a-form-item>

            <!-- Nút hành động -->
            <a-form-item class="form-actions">
                <a-button type="primary" html-type="submit">
                    {{ isEdit ? "Cập nhật" : "Thêm mới" }}
                </a-button>
                <a-button @click="$router.push('/dashboard/users')" class="cancel-button">
                    Hủy
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { getUserById, createUser, updateUser } from "@/apis/users";

export default {
    data() {
        return {
            user: {
                name: "",
                email: "",
                password: "",
                role: "",
            },
            avatarFile: null,
            previewImage: null,
            baseUrl: 'http://localhost:8080' // Base URL của server
        };
    },
    computed: {
        isEdit() {
            return !!this.$route.params.id;
        },
        formRules() {
            return {
                name: [{ required: true, message: 'Vui lòng nhập tên người dùng!' }],
                email: [{ type: 'email', required: true, message: 'Vui lòng nhập email hợp lệ!' }],
                role: [{ required: true, message: 'Vui lòng chọn vai trò!' }],
                password: !this.isEdit ? [{ required: true, message: 'Vui lòng nhập mật khẩu!' }] : [],
            };
        },
        avatarUrl() {
            return this.previewImage ? this.previewImage : this.baseUrl + this.user.avatar;
        }
    },
    methods: {
        async fetchUser() {
            try {
                if (this.isEdit) {
                    const { id } = this.$route.params;
                    const response = await getUserById(id);
                    const userData = response.data.data;

                    this.user = {
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        password: "",
                    };
                    if (userData.avatar) {
                        this.previewImage = userData.avatar;
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                this.$message.error("Không thể tải thông tin người dùng.");
            }
        },
        handleFileChange(event) {
            const file = event.target.files[0];

            this.avatarFile = file;

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.previewImage = e.target.result;
                };
                console.log('this.previewImage', this.previewImage)
                reader.readAsDataURL(file);
            }
        },
        async handleSubmit() {
            try {
                const formData = new FormData();
                formData.append('name', this.user.name);
                formData.append('email', this.user.email);
                formData.append('role', this.user.role);
                if (this.user.password) {
                    formData.append('password', this.user.password);
                }
                if (this.avatarFile) {
                    formData.append('avatar', this.avatarFile);
                }

                if (this.isEdit) {
                    console.log('formData',formData)
                    const { id } = this.$route.params;
                    await updateUser(id, formData);
                    this.$message.success("Người dùng đã được cập nhật!");
                } else {
                    await createUser(formData);
                    this.$message.success("Người dùng đã được thêm mới!");
                }
                this.$router.push("/dashboard/users");
            } catch (error) {
                console.error("Error saving user:", error.response?.data || error.message);
                this.$message.error("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        },
    },
    mounted() {
        if (this.isEdit) {
            this.fetchUser();
        }
    },
};
</script>

<style>

.avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 10px;
}
/* Toàn bộ container */
.user-form-container {
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
}

/* Tiêu đề */
.form-title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
}

/* Form */
.custom-form {
    display: flex;
    flex-direction: column;
}

/* Input và Select */
.custom-input,
.custom-select {
    height: 40px;
    font-size: 14px;
    border-radius: 4px;
}

/* Các hành động (nút) */
.form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.cancel-button {
    background: #f0f0f0;
    color: #333;
    border: none;
}

.cancel-button:hover {
    background: #e0e0e0;
    color: #000;
}

.form-actions .cancel-button {
    margin-left: 10px; /* Cách nút "Cập nhật" một khoảng */
}
</style>

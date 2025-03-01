<template>
    <div class="user-form-container">
        <h1 class="form-title">{{ isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới" }}</h1>
        <a-form @submit.prevent="handleSubmit" layout="vertical" class="custom-form" :model="user" :rules="formRules">
            <a-row :gutter="[16, 16]"> <!-- Row với khoảng cách 16px giữa các cột -->
                <!-- Cột 1 -->
                <a-col :span="12" :xs="24" :sm="12">
                    <!-- Tên người dùng -->
                    <a-form-item label="Tên người dùng" name="name">
                        <a-input v-model:value="user.name" placeholder="Nhập tên người dùng"/>
                    </a-form-item>

                    <!-- Email -->
                    <a-form-item label="Email" name="email"
                                 :rules="[{ type: 'email', required: true, message: 'Vui lòng nhập email hợp lệ!' }]">
                        <a-input type="email" v-model:value="user.email" placeholder="Nhập email"/>
                    </a-form-item>

                    <!-- Số điện thoại -->
                    <a-form-item label="Số điện thoại" name="phone"
                                 :rules="[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]">
                        <a-input v-model:value="user.phone" placeholder="Nhập số điện thoại"/>
                    </a-form-item>

                    <!-- Giới tính -->
                    <a-form-item label="Giới tính" name="gender"
                                 :rules="[{ required: true, message: 'Vui lòng chọn giới tính!' }]">
                        <a-select v-model:value="user.gender" placeholder="Chọn giới tính">
                            <a-select-option value="male">Nam</a-select-option>
                            <a-select-option value="female">Nữ</a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Avatar -->
                    <a-form-item label="Ảnh đại diện" name="avatar">
                        <a-upload
                            v-model:file-list="fileList"
                            name="file"
                            list-type="picture-card"
                            class="avatar-uploader"
                            :show-upload-list="false"
                            :before-upload="beforeUpload"
                            @change="handleChange"
                        >
                            <img v-if="imageUrl" :src="imageUrl" alt="Preview" class="avatar-preview" />
                            <div v-else>
                                <upload-outlined></upload-outlined>
                                <div class="ant-upload-text">Click to Upload</div>
                            </div>
                        </a-upload>
                    </a-form-item>

                </a-col>

                <!-- Cột 2 -->
                <a-col :span="12" :xs="24" :sm="12">
                    <!-- Mật khẩu -->
                    <a-form-item label="Mật khẩu" name="password"
                                 :rules="!isEdit ? [{ required: true, message: 'Vui lòng nhập mật khẩu!' }] : []">
                        <a-input type="password" v-model:value="user.password"
                                 :placeholder="isEdit ? 'Để trống nếu không muốn thay đổi' : 'Nhập mật khẩu'"
                                 class="custom-input"/>
                    </a-form-item>

                    <!-- Vai trò -->
                    <a-form-item label="Vai trò" name="role" :rules="[{ required: true, message: 'Vui lòng chọn vai trò!' }]">
                        <a-select v-model:value="user.role" placeholder="Chọn vai trò">
                            <a-select-option value="admin">Admin</a-select-option>
                            <a-select-option value="manager">Manager</a-select-option>
                            <a-select-option value="staff">Staff</a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Trạng thái Active -->
                    <a-form-item label="Trạng thái tài khoản" name="active">
                        <a-select v-model:value="user.active" placeholder="Chọn trạng thái">
                            <a-select-option value="enable">Hoạt động</a-select-option>
                            <a-select-option value="disable">Vô hiệu hóa</a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Mã định danh người dùng (user_code) -->
                    <a-form-item label="Mã định danh người dùng" name="user_code">
                        <a-input v-model:value="user.user_code" placeholder="Mã định danh" disabled/>
                    </a-form-item>

                </a-col>

            </a-row>

            <!-- Nút hành động -->
            <a-row>
                <a-col :span="24" class="form-actions">
                    <a-button type="primary" html-type="submit">
                        {{ isEdit ? "Cập nhật" : "Thêm mới" }}
                    </a-button>
                    <a-button @click="$router.push('/dashboard/users')" class="cancel-button">
                        Hủy
                    </a-button>
                </a-col>
            </a-row>
        </a-form>
    </div>
</template>

<script>
import { getUserById, createUser, updateUser } from "@/apis/users";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
export default {
    components: {
        UploadOutlined
    },
    data() {
        return {
            user: {
                name: "",
                email: "",
                password: "",
                role: "",
                phone: "",
                gender: "",
                active: "",
                user_code: ""
            },
            avatarFile: null,
            previewImage: null,
            baseUrl: window.location.origin, // Lấy URL động,
            fileList: [],
            imageUrl: "", // Ảnh preview
            headers: {
                authorization: "authorization-text",
            },
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
            if (this.previewImage) {
                // Nếu previewImage không phải URL hợp lệ, bỏ qua nó
                if (!this.isValidImageUrl(this.previewImage)) {
                    console.log('Không hợp lệ -> Dùng ảnh mặc định');
                    return this.baseUrl + "/images/avatar_default.jpg"; // Ảnh mặc định
                }
                return this.previewImage;
            }

            // Kiểm tra avatar từ user
            if (this.isValidImageUrl(this.user.avatar)) {
                return this.user.avatar;
            }

            // Nếu không có gì hợp lệ, dùng ảnh mặc định
            return this.baseUrl + "/images/avatar_default.jpg";
        }

    },
    methods: {

        handleChange(info) {
            let fileObj = info.file.originFileObj || info.file; // Lấy file gốc

            if (!fileObj) {
                console.warn("📌 Không tìm thấy file gốc!");
                return;
            }

            // Lưu file để gửi lên API
            this.avatarFile = fileObj;

            // Hiển thị ảnh preview
            this.getBase64(fileObj, (base64Url) => {
                this.imageUrl = base64Url;
            });
        },
        getBase64(file, callback) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                callback(reader.result);
            };
            reader.onerror = (error) => {
                console.error("❌ Lỗi khi đọc file:", error);
                message.error("Không thể xử lý ảnh.");
            };
        },
        beforeUpload(file) {
            const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
                message.error("Bạn chỉ có thể tải lên ảnh JPG/PNG!");
                return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error("Ảnh phải nhỏ hơn 2MB!");
                return false;
            }

            // Trả về `false` để chặn upload lên server
            return false;
        },
        isValidImageUrl(url) {
            if (!url || typeof url !== "string" || url.length < 5) {
                return false; // Không hợp lệ nếu rỗng, không phải string, hoặc quá ngắn
            }

            // Nếu là URL đầy đủ (http hoặc https), hợp lệ
            if (url.startsWith("http")) {
                return true;
            }

            // Nếu là đường dẫn ảnh hợp lệ (.jpg, .png, .gif, .webp)
            return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
        },
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
                        gender: userData.gender,
                        phone: userData.phone,
                        active: userData.active,
                        user_code: userData.user_code,
                        password: "",
                    };

                    // Kiểm tra nếu avatar tồn tại
                    if (this.isValidImageUrl(userData.avatar)) {
                        this.imageUrl = userData.avatar.startsWith("http")
                            ? userData.avatar // Nếu đã là URL đầy đủ, giữ nguyên
                            : `${this.baseUrl}${userData.avatar}`; // Nếu là đường dẫn tương đối, thêm baseUrl
                    } else {
                        this.imageUrl = `${this.baseUrl}/images/avatar_default.jpg`;
                    }
                }
            } catch (error) {
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
                formData.append("name", this.user.name.trim());
                formData.append("email", this.user.email.trim());
                formData.append("role", this.user.role);

                if (this.user.password && this.user.password.trim()) {
                    formData.append("password", this.user.password.trim());
                }

                if (this.avatarFile) {
                    formData.append("avatar", this.avatarFile);
                }

                if (this.isEdit) {
                    const { id } = this.$route.params;
                    await updateUser(id, formData);
                    this.$message.success("Người dùng đã được cập nhật!");
                } else {
                    await createUser(formData);
                    this.$message.success("Người dùng đã được thêm mới!");
                }

                this.$router.push("/dashboard/users");
            } catch (error) {
                console.error("❌ Lỗi khi lưu user:", error.response?.data || error.message);
                this.$message.error("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        }

        ,
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
}
/* Toàn bộ container */
.user-form-container {
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 800px;
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

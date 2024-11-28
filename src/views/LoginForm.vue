<template>
    <div class="login-container">
        <a-row justify="center" align="middle" class="login-row">
            <a-col xs="24" sm="20" md="16" lg="12" xl="8">
                <a-card title="Login" :bordered="false" class="login-card">
                    <a-form :model="formState" name="login-form" :label-col="{ xs: 24, sm: 8 }"
                        :wrapper-col="{ xs: 24, sm: 16 }" autocomplete="off" @finish="handleLogin"
                        @finishFailed="onFinishFailed">
                        <a-form-item label="Email" name="email"
                            :rules="[{ required: true, message: 'Please input your email!', type: 'email' }]">
                            <a-input v-model:value="formState.email" placeholder="Enter your email" />
                        </a-form-item>

                        <a-form-item label="Password" name="password"
                            :rules="[{ required: true, message: 'Please input your password!' }]">
                            <a-input-password v-model:value="formState.password" placeholder="Enter your password" />
                        </a-form-item>

                        <a-form-item :wrapper-col="{ xs: { span: 24 }, sm: { offset: 8, span: 16 } }">
                            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                        </a-form-item>

                        <a-form-item :wrapper-col="{ xs: { span: 24 }, sm: { offset: 8, span: 16 } }">
                            <a-button type="primary" html-type="submit" block>Login</a-button>
                        </a-form-item>
                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import { handleLogin } from "@/apis/authApi";
import { message } from "ant-design-vue";

export default {
    name: "LoginForm",
    data() {
        return {
            formState: {
                email: "", // Email người dùng nhập
                password: "", // Mật khẩu người dùng nhập
                remember: false, // Checkbox "Remember me"
            },
        };
    },
    methods: {
        async handleLogin() {
            try {
                const response = await handleLogin(this.formState.email, this.formState.password); // Gọi API login
                localStorage.setItem("auth_token", response.token); // Lưu token vào localStorage

                // Hiển thị thông báo thành công
                message.success("Login successful!");

                // Điều hướng sang Dashboard
                this.$router.push("/dashboard");
            } catch (error) {
                // Hiển thị thông báo lỗi
                const errorMessage =
                    error.response?.data?.message || "Login failed. Please check your credentials.";
                console.error("Login failed:", errorMessage);
                message.error(errorMessage);
            }
        },
        onFinishFailed(errorInfo) {
            // Hiển thị thông báo khi validation không hợp lệ
            console.log("Validation Failed:", errorInfo);
            message.warning("Validation failed. Please check your input.");
        },
    },
};
</script>

<style scoped>
.login-container {
    height: 100vh;
    /* Chiều cao toàn màn hình */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f2f5;
    /* Màu nền nhẹ */
    padding: 16px;
    /* Thêm padding để không sát mép màn hình trên mobile */
}

.login-row {
    width: 100%;
}

.login-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    /* Hiệu ứng đổ bóng */
    border-radius: 8px;
    /* Bo góc */
    padding: 24px;
    background: #fff;
}
</style>

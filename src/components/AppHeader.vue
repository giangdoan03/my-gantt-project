<template>
    <a-layout-header style="background: #fff; padding: 0" class="header_bar">
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="$emit('update:collapsed', !collapsed)" />
        <menu-fold-outlined v-else class="trigger" @click="$emit('update:collapsed', !collapsed)" />
        <div class="header_right">
            <a-dropdown>
                <a span>
                    <user-outlined class="user-icon" /> {{ currentUser.name || 'User' }}
                </a>
                <template #overlay>
                    <a-menu>
                        <a-menu-item>
                            <a-avatar size="large" :src="currentUser.avatar || null" />
                            <div>
                                <p><b>Tên:</b> {{ currentUser.name }}</p>
                                <p><b>Email:</b> {{ currentUser.email }}</p>
                                <p><b>Vai trò:</b> {{ currentUser.role }}</p>
                            </div>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
            <logout-outlined class="logout-icon" @click="confirmLogout" />
        </div>
    </a-layout-header>
</template>


<script>
import { MenuUnfoldOutlined, MenuFoldOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue';
import { Modal, message } from "ant-design-vue";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: 'AppHeader',
    props: {
        collapsed: {
            type: Boolean,
            required: true, // Đảm bảo thuộc tính này luôn được truyền từ cha
        },
    },
    components: {
        MenuUnfoldOutlined,
        MenuFoldOutlined,
        LogoutOutlined,
        UserOutlined,
    },
    computed: {
        authStore() {
            return useAuthStore();
        },
        isLoggedIn() {
            return !!this.authStore.token;
        },
        currentUser() {
            return this.authStore.user || {};
        },
    },
    methods: {
        async logout() {
            try {
                const authStore = useAuthStore();
                authStore.logout();
                this.$router.push("/");
                message.success("Bạn đã đăng xuất khỏi hệ thống!");
            } catch (error) {
                console.error("Logout failed:", error);
                message.error("Đăng xuất thất bại! Vui lòng thử lại.");
            }
        },
        confirmLogout() {
            Modal.confirm({
                title: "Xác nhận đăng xuất",
                content: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
                okText: "Đồng ý",
                cancelText: "Hủy",
                onOk: this.logout,
            });
        },
    },
};
</script>
<style scoped>
.trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

.trigger:hover {
    color: #1890ff;
}

.header_bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header_right {
    display: flex;
    align-items: center;
    padding-right: 24px;
}

.user-icon {
    font-size: 18px;
    margin-right: 8px;
    cursor: pointer;
    transition: color 0.3s;
}

.user-icon:hover {
    color: #1890ff;
}

.logout-icon {
    font-size: 18px;
    margin-left: 16px;
    cursor: pointer;
    transition: color 0.3s;
}

.logout-icon:hover {
    color: #1890ff;
}
</style>

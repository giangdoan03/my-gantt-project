<template>
    <a-layout-sider :collapsed="collapsed" :trigger="null" collapsible>
        <div class="logo">
            <span class="header-title">Hệ Thống Quản Lý</span>
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
            <a-menu-item key="1">
                <user-outlined />
                <span>Dashboard</span>
            </a-menu-item>
            <a-menu-item key="2">
                <video-camera-outlined />
                <span>Videos</span>
            </a-menu-item>
            <a-menu-item key="3">
                <upload-outlined />
                <span>Uploads</span>
            </a-menu-item>
            <a-menu-item key="4" @click="navigateToRoles">
                <team-outlined />
                <span>Quản lý Vai Trò</span>
            </a-menu-item>
            <a-menu-item key="5" @click="navigateToUsers">
                <usergroup-add-outlined />
                <span>Quản lý Thành Viên</span>
            </a-menu-item>
        </a-menu>
    </a-layout-sider>
</template>


<script>
import { UserOutlined, VideoCameraOutlined, UploadOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons-vue';


export default {
    name: 'AppSidebar',
    components: {
        UserOutlined,
        VideoCameraOutlined,
        UploadOutlined,
        TeamOutlined,
        UsergroupAddOutlined
    },
    props: {
        collapsed: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            selectedKeys: ['1'], // Menu được chọn
        };
    },
    methods: {
        navigateToRoles() {
            // Điều hướng đến trang danh sách vai trò
            this.$router.push({ name: 'RolesList' });
        },
        navigateToUsers() {
            // Điều hướng đến trang danh sách vai trò
            this.$router.push({ name: 'UserList' });
        },
    },
};
</script>

<style scoped>
.logo {
    height: 32px;
    margin: 16px;
}

.a-layout-sider {
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
    color: #ffffff;
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
}

.header-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
    display: block;
    line-height: 1.5;
    text-align: center;
}

</style>
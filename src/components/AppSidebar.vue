<template>
    <a-layout-sider :collapsed="collapsed" :trigger="null" collapsible>
        <div :class="['logo', { 'logo-collapsed': collapsed }]">
            <span class="header-title" v-if="!collapsed">Hệ Thống Quản Lý</span>
            <DashboardOutlined class="dashboard-icon" v-else />
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
            <a-menu-item key="1" @click="navigateToDashboard">
                <user-outlined />
                <span>Dashboard</span>
            </a-menu-item>
            <a-menu-item key="6" @click="navigateToContracts">
                <file-done-outlined />
                <span>Hợp đồng</span>
            </a-menu-item>
            <a-menu-item key="7" @click="navigateToCustomers">
                <team-outlined />
                <span>Khách hàng</span>
            </a-menu-item>
            <a-menu-item key="2">
                <video-camera-outlined />
                <span>Videos</span>
            </a-menu-item>
            <a-menu-item key="3" @click="navigateToDepartmentFile">
                <folder-outlined />
                <span>File lưu trữ</span>
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
import { UserOutlined, VideoCameraOutlined, FolderOutlined, TeamOutlined, UsergroupAddOutlined, FileDoneOutlined, DashboardOutlined } from '@ant-design/icons-vue';


export default {
    name: 'AppSidebar',
    components: {
        UserOutlined,
        VideoCameraOutlined,
        FolderOutlined,
        TeamOutlined,
        UsergroupAddOutlined,
        FileDoneOutlined,
        DashboardOutlined
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
            this.$router.push({ name: 'RolesList' });
        },
        navigateToUsers() {
            this.$router.push({ name: 'UserList' });
        },
        navigateToContracts() {
            this.$router.push({ name: "ContractsList" });
        },
        navigateToDashboard() {
            this.$router.push({ name: "DashboardPage" });
        },
        navigateToCustomers() {
            this.$router.push({ name: "CustomersList" }); // Điều hướng tới danh sách khách hàng
        },
        navigateToDepartmentFile() {
            this.$router.push({ name: "ListFileDepartment" }); // Điều hướng tới danh sách khách hàng
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
    font-size: 15px;
    font-weight: bold;
    display: block;
    line-height: 1.5;
    text-align: center;
}

/* Để logo dashboard nổi bật */
.dashboard-icon {
    font-size: 24px; /* Làm biểu tượng lớn hơn */
    color: #ffffff; /* Màu trắng sáng */
    margin-right: 10px; /* Khoảng cách từ biểu tượng đến các thành phần khác */
}

/* Biểu tượng trong menu */
.menu-icon {
    font-size: 20px; /* Tăng kích thước icon menu */
    color: #40a9ff; /* Màu xanh dương sáng */
    transition: color 0.3s ease; /* Hiệu ứng khi hover */
}

.menu-icon:hover {
    color: #69c0ff; /* Đổi màu khi hover */
}

/* Thay đổi màu nền logo */
.logo {
    text-align: center;
    padding: 10px;
    background-color: #1d1d1d; /* Nền logo */
    color: #fff; /* Màu chữ trắng */
}

</style>
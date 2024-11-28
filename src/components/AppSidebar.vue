<template>
    <a-layout-sider :collapsed="collapsed" :trigger="null" collapsible>
        <div class="logo" />
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
        </a-menu>
    </a-layout-sider>
</template>

<script>
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons-vue';

export default {
    name: 'AppSidebar',
    components: {
        UserOutlined,
        VideoCameraOutlined,
        UploadOutlined,
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
};
</script>

<style scoped>
.logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
}
.a-layout-sider {
  height: 100%; /* Đảm bảo Sidebar chiếm toàn bộ chiều cao */
}
</style>
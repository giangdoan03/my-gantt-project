<template>
    <a-layout style="min-height: 100vh">
        <!-- Sidebar -->
        <AppSidebar :collapsed="collapsed" @toggle="toggleCollapse"/>

        <!-- Main Layout -->
        <a-layout>
            <!-- Header -->
            <!-- <AppHeader v-model:collapsed="collapsed" /> -->

            <app-header v-model:collapsed="collapsed" :collapsed="isCollapsed"
                        @update:collapsed="isCollapsed = $event"/>

            <!-- Content -->
            <a-layout-content style="margin: 24px 16px; padding: 24px; background: #fff; flex: 1">
                <router-view/>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script>
import AppSidebar from '@/components/AppSidebar.vue';
import AppHeader from '@/components/AppHeader.vue';

export default {
    name: 'DefaultLayout',
    components: {
        AppSidebar,
        AppHeader,
    },
    data() {
        return {
            collapsed: false, // Trạng thái sidebar
        };
    },
    mounted() {
        this.updateSidebarState();
        window.addEventListener('resize', this.updateSidebarState);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateSidebarState);
    },
    methods: {
        toggleCollapse() {
            this.collapsed = !this.collapsed; // Toggle trạng thái sidebar
        },
        updateSidebarState() {
            const width = window.innerWidth;
            this.collapsed = width < 768; // Thu sidebar nếu màn hình nhỏ hơn 768px
        },
    },
};
</script>


<style scoped>
/* Đảm bảo sidebar và nội dung chiếm đủ chiều cao */
.a-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
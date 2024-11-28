<template>
    <a-layout-header style="background: #fff; padding: 0">
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="$emit('update:collapsed', !collapsed)" />
        <menu-fold-outlined v-else class="trigger" @click="$emit('update:collapsed', !collapsed)" />
    </a-layout-header>
</template>

<script>
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';

export default {
    name: 'AppHeader',
    components: {
        MenuUnfoldOutlined,
        MenuFoldOutlined,
    },
    props: {
        collapsed: {
            type: Boolean,
            required: true,
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
</style>
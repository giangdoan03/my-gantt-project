<template>
    <a-avatar-group>
        <!-- Duyệt qua danh sách owner_details -->
        <template v-for="(owner, index) in owners" :key="index">
            <!-- Avatar với hình ảnh -->
            <a-avatar v-if="owner.type === 'image'" :src="owner.src" />

            <!-- Avatar với chữ cái đầu tiên -->
            <a
                v-else-if="owner.type === 'text'"
                href="https://www.antdv.com"
                target="_blank"
            >
                <a-avatar :style="{ backgroundColor: owner.backgroundColor }">
                    {{ owner.name.charAt(0).toUpperCase() }}
                </a-avatar>
            </a>

            <!-- Tooltip nếu có -->
            <a-tooltip
                v-if="owner.tooltip"
                :title="owner.tooltip"
                placement="top"
            >
                <a-avatar :style="{ backgroundColor: owner.backgroundColor }">
                    <template v-if="owner.icon">
                        <component :is="owner.icon" />
                    </template>
                </a-avatar>
            </a-tooltip>
        </template>
    </a-avatar-group>
</template>

<script>
export default {
    name: "AvatarGroup",
    props: {
        owners: {
            type: Array,
            required: true,
        },
    },
};
</script>

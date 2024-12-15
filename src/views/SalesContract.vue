<template>
    <div style="height: 100vh">
        <!-- Button quay về thông tin hợp đồng -->
        <div class="header_controls">
            <a-button type="primary" @click="goBackToContract">
                Thông tin hợp đồng
            </a-button>
        </div>
        <ResourceLoadDiagram/>
    </div>
</template>

<script>
import ResourceLoadDiagram from "@/components/ResourceLoadDiagram.vue";
import "../assets/css/dhtmlxgantt.css"; // CSS tùy chỉnh của bạn
import "../assets/css/controls_styles.css"; // CSS tùy chỉnh của bạn

export default {
    props: {
        id: {
            type: String,
            required: true, // Bắt buộc nhận `id` từ URL
        },
    },
    mounted() {
        console.log("Contract ID:", this.id);
        // Dùng `id` để tải dữ liệu liên quan tới contract
    },
    components: {
        ResourceLoadDiagram,
    },
    methods: {
        goBackToContract() {
            // Điều hướng quay về thông tin hợp đồng
            this.$router.push(`/contracts/${this.id}`); // Sử dụng Vue Router
        },
    },
};
</script>

<style>
.header_controls {
    margin-bottom: 10px;
}
</style>

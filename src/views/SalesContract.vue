<template>
    <div style="height: 100vh">
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
            required: true,
        },
    },
    mounted() {
        console.log("Contract ID:", this.id);
        // Dùng `id` để tải dữ liệu liên quan tới contract
    },
    components: {
        ResourceLoadDiagram,
    },
};
</script>
  
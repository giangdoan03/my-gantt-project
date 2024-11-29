<template>
    <div style="height: 100vh">
      <ResourceLoadDiagram />
    </div>
  </template>
  
  <script>
  import ResourceLoadDiagram from "@/components/ResourceLoadDiagram.vue";
  import "../assets/dhtmlxgantt.css"; // CSS tùy chỉnh của bạn
  
  export default {
    components: {
      ResourceLoadDiagram,
    },
  };
  </script>
  
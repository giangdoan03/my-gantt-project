<template>
    <div class="file-archive-container">
        <a-page-header
            title="Lưu trữ tài liệu"
            sub-title="Quản lý tài liệu của các phòng ban"
            back-icon={null}
        >
            <template #extra>
                <a-button type="primary" @click="handleUpload">
                    <upload-outlined />
                    Tải lên tài liệu
                </a-button>
            </template>

        </a-page-header>
        <a-tabs default-active-key="all" @change="handleTabChange">
            <a-tab-pane key="all" tab="Tất cả tài liệu">
                <FileList :files="files" />
            </a-tab-pane>
            <a-tab-pane
                v-for="department in departments"
                :key="department.id"
                :tab="department.name"
            >
                <FileList :files="filterFilesByDepartment(department.id)" />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
import FileList from "@/components/FileList.vue";
import { UploadOutlined } from "@ant-design/icons-vue";

export default {
    name: "DepartmentFileArchive",
    components: {
        FileList,
        UploadOutlined,
    },
    data() {
        return {
            files: [
                { id: 1, name: "Kế hoạch Q1.pdf", departmentId: 1, date: "2024-01-10" },
                { id: 2, name: "Báo cáo Tài chính.xlsx", departmentId: 2, date: "2024-02-15" },
                { id: 3, name: "Hợp đồng mẫu.docx", departmentId: 3, date: "2024-03-01" },
            ],
            departments: [
                { id: 1, name: "Phòng Kế hoạch" },
                { id: 2, name: "Phòng Tài chính" },
                { id: 3, name: "Phòng Nhân sự" },
            ],
        };
    },
    methods: {
        handleUpload() {
            console.log("Tải lên tài liệu mới.");
        },
        handleTabChange(activeKey) {
            console.log("Tab thay đổi:", activeKey);
        },
        filterFilesByDepartment(departmentId) {
            return this.files.filter((file) => file.departmentId === departmentId);
        },
    },
};
</script>

<style scoped>
.file-archive-container {
    padding: 16px;
    background: #fff;
}
</style>

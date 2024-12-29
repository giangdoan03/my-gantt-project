<template>
    <div class="task-details">
        <!-- Tiêu đề -->
        <div class="header">
            <h2>Chi Tiết Đầu Việc</h2>
            <a-button type="primary" @click="$router.push({ name: 'PendingTasksList' })">
                Quay lại danh sách
            </a-button>
        </div>

        <!-- Thông tin đầu việc -->
        <a-card title="Thông Tin Đầu Việc" class="info-card" v-if="task">
            <a-descriptions bordered :column="1">
                <a-descriptions-item label="Tên Đầu Việc">{{ task.task_name }}</a-descriptions-item>
                <a-descriptions-item label="Người Phụ Trách">{{ task.assigned_to }}</a-descriptions-item>
                <a-descriptions-item label="Mức Độ Ưu Tiên">{{ task.priority }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Hạn Cuối">{{ task.deadline }}</a-descriptions-item>
                <a-descriptions-item label="Trạng Thái">{{ task.status }}</a-descriptions-item>
                <a-descriptions-item label="Lý Do Hủy" v-if="task.cancel_reason">{{ task.cancel_reason }}</a-descriptions-item>
                <a-descriptions-item label="Ghi Chú">{{ task.notes }}</a-descriptions-item>
                <a-descriptions-item label="Tài Liệu Đính Kèm">
                    <ul>
                        <li v-for="(doc, index) in parsedDocuments" :key="index">
                            <a :href="doc.path" target="_blank">{{ doc.name }}</a>
                        </li>
                    </ul>
                </a-descriptions-item>
                <a-descriptions-item label="Ngày Tạo">{{ task.created_at }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Cập Nhật">{{ task.updated_at }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <!-- Hiển thị thông báo đang tải -->
        <a-spin v-else style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            Đang tải thông tin đầu việc...
        </a-spin>

        <!-- Nhận xét về đầu việc -->
        <a-card title="Nhận Xét Đầu Việc" class="comments-card">
            <a-form @submit.prevent="submitComment">
                <a-form-item>
                    <a-textarea
                        v-model="newComment"
                        placeholder="Nhập nhận xét về đầu việc"
                        :rows="4"
                    />
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit">Lưu Nhận Xét</a-button>
                </a-form-item>
            </a-form>

            <!-- Danh sách nhận xét -->
            <a-list
                class="comment-list"
                header="Lịch Sử Nhận Xét"
                :dataSource="comments"
            >
                <template #item="{ item }">
                    <a-list-item>
                        <a-list-item-meta
                            :title="item.date"
                            :description="item.content"
                        />
                    </a-list-item>
                </template>
            </a-list>
        </a-card>
    </div>
</template>

<script>
import { message } from "ant-design-vue";
import { getTaskDetails } from "@/apis/tasks"; // Import API để lấy dữ liệu đầu việc

export default {
    name: "PendingTaskDetail",
    data() {
        return {
            task: null, // Chi tiết đầu việc
            comments: [], // Danh sách nhận xét
            newComment: "", // Nhận xét mới
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    computed: {
        parsedDocuments() {
            try {
                return JSON.parse(this.task.documents || "[]");
            } catch (e) {
                return [];
            }
        },
    },
    async mounted() {
        const taskId = this.$route.params.id; // Lấy ID đầu việc từ URL
        await this.loadTaskDetails(taskId); // Tải chi tiết đầu việc
    },
    methods: {
        async loadTaskDetails(id) {
            this.loading = true;
            try {
                const response = await getTaskDetails(id); // Gọi API lấy dữ liệu đầu việc
                this.task = response; // Lưu chi tiết đầu việc
                this.comments = [
                    // Dữ liệu mẫu nhận xét
                    { id: 1, content: "Nhận xét mẫu 1.", date: "2024-12-01" },
                    { id: 2, content: "Nhận xét mẫu 2.", date: "2024-12-05" },
                ];
            } catch (error) {
                message.error("Không thể tải thông tin đầu việc.");
                console.error("Error fetching task details:", error);
            } finally {
                this.loading = false;
            }
        },
        submitComment() {
            if (this.newComment.trim() === "") {
                message.warning("Nhận xét không được để trống.");
                return;
            }

            const newComment = {
                id: this.comments.length + 1,
                content: this.newComment,
                date: new Date().toISOString().split("T")[0],
            };
            this.comments.push(newComment);
            this.newComment = ""; // Reset nhận xét
            message.success("Nhận xét đã được lưu.");
        },
    },
};
</script>

<style scoped>
.task-details {
    padding: 24px;
    background: #f0f2f5;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.info-card,
.comments-card {
    margin-bottom: 20px;
}

.comment-list {
    margin-top: 20px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
}
</style>

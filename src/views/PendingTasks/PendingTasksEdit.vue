<template>
    <div class="edit-task">
        <div class="header">
            <h2>Sửa Thông Tin Đầu Việc Chờ</h2>
            <a-button type="default" @click="$router.push({ name: 'PendingTasksList' })">
                Quay lại danh sách đầu việc
            </a-button>
        </div>

        <!-- Kiểm tra nếu task đã tải -->
        <a-card title="Thông Tin Đầu Việc" v-if="task">
            <a-form :model="task" :layout="'vertical'" @submit.prevent="updateTask">
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Đầu Việc" :rules="[{ required: true, message: 'Vui lòng nhập tên đầu việc!' }]">
                            <a-input v-model:value="task.task_name" placeholder="Nhập tên đầu việc" />
                        </a-form-item>
                        <a-form-item label="Người Phụ Trách" :rules="[{ required: true, message: 'Vui lòng nhập tên người phụ trách!' }]">
                            <a-input v-model:value="task.assigned_to" placeholder="Nhập tên người phụ trách" />
                        </a-form-item>
                        <a-form-item label="Ưu Tiên" :rules="[{ required: true, message: 'Vui lòng chọn mức ưu tiên!' }]">
                            <a-select v-model:value="task.priority" placeholder="Chọn mức ưu tiên">
                                <a-select-option value="Thấp">Thấp</a-select-option>
                                <a-select-option value="Trung Bình">Trung Bình</a-select-option>
                                <a-select-option value="Cao">Cao</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="Ngày Hạn Cuối">
                            <a-date-picker
                                v-model:value="task.deadline"
                                format="YYYY-MM-DD"
                                placeholder="Chọn ngày hạn cuối"
                            />
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Trạng Thái">
                            <a-select v-model:value="task.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Đang chờ xử lý">Đang chờ xử lý</a-select-option>
                                <a-select-option value="Hoàn thành">Hoàn thành</a-select-option>
                                <a-select-option value="Đã hủy">Đã hủy</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item v-if="task.status === 'Đã hủy'" label="Lý Do Hủy">
                            <a-input v-model:value="task.cancel_reason" placeholder="Nhập lý do hủy" />
                        </a-form-item>
                        <a-form-item label="Ghi Chú">
                            <a-textarea v-model:value="task.notes" placeholder="Nhập ghi chú" rows="4" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-form-item>
                    <a-button type="primary" html-type="submit">
                        Lưu Thay Đổi
                    </a-button>
                </a-form-item>
            </a-form>
        </a-card>

        <!-- Hiển thị spinner khi đang tải -->
        <a-spin v-else style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            Đang tải thông tin đầu việc...
        </a-spin>
    </div>
</template>

<script>
import { getTaskDetails, updateTask } from "@/apis/tasks"; // Import API
import { message } from "ant-design-vue";
import dayjs from "dayjs";

export default {
    name: "PendingTasksEdit",
    data() {
        return {
            task: null, // Dữ liệu đầu việc
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    async mounted() {
        const taskId = this.$route.params.id; // Lấy ID từ route
        await this.loadTask(taskId); // Tải dữ liệu đầu việc
    },
    methods: {
        async loadTask(id) {
            this.loading = true;
            try {
                const response = await getTaskDetails(id); // Lấy dữ liệu từ API
                if (response.deadline) {
                    response.deadline = dayjs(response.deadline); // Chuyển đổi thành Day.js object
                }
                this.task = response;
            } catch (error) {
                console.error("Error loading task:", error);
                message.error("Không thể tải thông tin đầu việc.");
            } finally {
                this.loading = false;
            }
        },
        async updateTask() {
            try {
                const payload = { ...this.task };
                if (payload.deadline) {
                    payload.deadline = dayjs(payload.deadline).format("YYYY-MM-DD"); // Định dạng lại ngày
                }
                await updateTask(payload.id, payload); // Gửi dữ liệu tới API
                message.success("Thông tin đầu việc đã được cập nhật.");
                this.$router.push({ name: "PendingTasksList" });
            } catch (error) {
                console.error("Error updating task:", error);
                message.error("Không thể cập nhật thông tin đầu việc.");
            }
        },
    },
};
</script>

<style scoped>
.edit-task {
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
</style>

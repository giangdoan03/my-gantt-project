<template>
    <div>
        <h1>Thêm đầu việc mới</h1>
        <a-form @submit.prevent="handleSubmit">
            <!-- Tên đầu việc -->
            <a-form-item label="Tên đầu việc" required>
                <a-input v-model="task.task_name" placeholder="Nhập tên đầu việc" />
            </a-form-item>

            <!-- Người phụ trách -->
            <a-form-item label="Người phụ trách" required>
                <a-input v-model="task.assigned_to" placeholder="Nhập người phụ trách" />
            </a-form-item>

            <!-- Mức độ ưu tiên -->
            <a-form-item label="Mức độ ưu tiên" required>
                <a-select v-model="task.priority" placeholder="Chọn mức độ ưu tiên">
                    <a-select-option value="Thấp">Thấp</a-select-option>
                    <a-select-option value="Trung Bình">Trung Bình</a-select-option>
                    <a-select-option value="Cao">Cao</a-select-option>
                </a-select>
            </a-form-item>

            <!-- Ngày hạn cuối -->
            <a-form-item label="Ngày hạn cuối" required>
                <a-date-picker v-model="task.deadline" placeholder="Chọn ngày hạn cuối" style="width: 100%;" />
            </a-form-item>

            <!-- Trạng thái -->
            <a-form-item label="Trạng thái" required>
                <a-select v-model="task.status" placeholder="Chọn trạng thái">
                    <a-select-option value="Đang chờ xử lý">Đang chờ xử lý</a-select-option>
                    <a-select-option value="Hoàn thành">Hoàn thành</a-select-option>
                    <a-select-option value="Đã hủy">Đã hủy</a-select-option>
                </a-select>
            </a-form-item>

            <!-- Lý do hủy -->
            <a-form-item v-if="task.status === 'Đã hủy'" label="Lý do hủy">
                <a-input v-model="task.cancel_reason" placeholder="Nhập lý do hủy" />
            </a-form-item>

            <!-- Ghi chú -->
            <a-form-item label="Ghi chú">
                <a-textarea v-model="task.notes" placeholder="Nhập ghi chú" rows="4" />
            </a-form-item>

            <!-- Tài liệu đính kèm -->
            <a-form-item label="Tài liệu đính kèm">
                <a-input
                    v-model="document.name"
                    placeholder="Nhập tên tài liệu"
                    style="margin-bottom: 10px;"
                />
                <a-input
                    v-model="document.path"
                    placeholder="Nhập đường dẫn tài liệu"
                    style="margin-bottom: 10px;"
                />
                <a-button type="primary" @click="addDocument">Thêm tài liệu</a-button>
                <ul>
                    <li v-for="(doc, index) in task.documents" :key="index">
                        {{ doc.name }} - {{ doc.path }}
                        <a-button type="link" @click="removeDocument(index)">Xóa</a-button>
                    </li>
                </ul>
            </a-form-item>

            <!-- Nút Lưu -->
            <a-form-item>
                <a-button type="primary" html-type="submit">Lưu</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { createTask } from "@/apis/tasks"; // Import API để thêm đầu việc mới

export default {
    data() {
        return {
            task: {
                task_name: "",
                assigned_to: "",
                priority: "Thấp",
                deadline: null,
                status: "Đang chờ xử lý",
                cancel_reason: "",
                notes: "",
                documents: [],
            },
            document: {
                name: "",
                path: "",
            },
        };
    },
    methods: {
        // Thêm tài liệu vào danh sách documents
        addDocument() {
            if (this.document.name && this.document.path) {
                this.task.documents.push({ ...this.document });
                this.document.name = "";
                this.document.path = "";
            } else {
                this.$message.error("Vui lòng nhập tên và đường dẫn tài liệu!");
            }
        },

        // Xóa tài liệu khỏi danh sách documents
        removeDocument(index) {
            this.task.documents.splice(index, 1);
        },

        // Gửi dữ liệu lên server
        async handleSubmit() {
            try {
                await createTask(this.task);
                this.$message.success("Thêm đầu việc thành công!");
                this.$router.push("/pending-tasks"); // Chuyển hướng về danh sách đầu việc
            } catch (error) {
                this.$message.error("Không thể thêm đầu việc!");
                console.error("Failed to create task:", error);
            }
        },
    },
};
</script>

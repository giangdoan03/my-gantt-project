<template>
    <div class="tasks-list">
        <!-- Tiêu đề và thanh công cụ -->
        <div class="header">
            <h2>Danh Sách Đầu Việc Chờ</h2>
            <a-input-search
                v-model:value="searchKeyword"
                placeholder="Tìm kiếm đầu việc..."
                @search="handleSearch"
                style="width: 300px"
            />
            <a-button type="primary" @click="showAddTaskModal">
                <plus-outlined />
                Thêm Đầu Việc
            </a-button>
        </div>

        <!-- Modal Thêm Đầu Việc -->
        <a-modal
            v-model:open="addTaskModalVisible"
            title="Thêm Đầu Việc"
            ok-text="Lưu"
            cancel-text="Hủy"
            width="1000px"
            centered
            @ok="handleAddTask"
        >
            <a-form :model="newTask" :layout="'vertical'" ref="addTaskForm">
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Đầu Việc" :rules="[{ required: true, message: 'Vui lòng nhập tên đầu việc!' }]">
                            <a-input v-model:value="newTask.task_name" placeholder="Nhập tên đầu việc" />
                        </a-form-item>
                        <a-form-item label="Người Phụ Trách" :rules="[{ required: true, message: 'Vui lòng nhập tên người phụ trách!' }]">
                            <!-- Trường nhập liệu -->
                            <a-input v-model:value="newTask.assigned_to" placeholder="Nhập tên người phụ trách" />

                            <!-- Nhóm avatar -->
                            <div style="margin-top: 10px;">
                                <a-avatar-group>
                                    <a-avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1" />
                                    <a href="https://www.antdv.com">
                                        <a-avatar style="background-color: #f56a00">K</a-avatar>
                                    </a>
                                    <a-tooltip title="Ant User" placement="top">
                                        <a-avatar style="background-color: #87d068">
                                            <template #icon><user-outlined /></template>
                                        </a-avatar>
                                    </a-tooltip>
                                    <a-avatar style="background-color: #1890ff">
                                        <template #icon><ant-design-outlined /></template>
                                    </a-avatar>
                                </a-avatar-group>
                            </div>
                        </a-form-item>
                        <a-form-item label="Ưu Tiên" :rules="[{ required: true, message: 'Vui lòng chọn mức ưu tiên!' }]">
                            <a-select v-model:value="newTask.priority" placeholder="Chọn mức ưu tiên">
                                <a-select-option value="Thấp">Thấp</a-select-option>
                                <a-select-option value="Trung Bình">Trung Bình</a-select-option>
                                <a-select-option value="Cao">Cao</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Ngày Hạn Cuối" :rules="[{ required: true, message: 'Vui lòng chọn ngày!' }]">
                            <a-date-picker v-model:value="newTask.deadline" placeholder="Chọn ngày hạn cuối" format="YYYY-MM-DD" />
                        </a-form-item>
                        <a-form-item label="Trạng Thái" :rules="[{ required: true, message: 'Vui lòng chọn trạng thái!' }]">
                            <a-select v-model:value="newTask.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Đang chờ xử lý">Đang chờ xử lý</a-select-option>
                                <a-select-option value="Hoàn thành">Hoàn thành</a-select-option>
                                <a-select-option value="Đã hủy">Đã hủy</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item v-if="newTask.status === 'Đã hủy'" label="Lý Do Hủy">
                            <a-input v-model:value="newTask.cancel_reason" placeholder="Nhập lý do hủy" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>

        <!-- Bảng đầu việc -->
        <a-table
            :columns="columns"
            :data-source="filteredTasks"
            :row-key="record => record.id"
            :loading="loading"
            @change="handleTableChange"
            bordered
            :scroll="{ x: 800 }"
        >
            <template v-slot:bodyCell="{ column, record }">
                <template v-if="column && column.key === 'actions'">
                    <a-space>
                        <!-- Nút Sửa -->
                        <a-tooltip title="Sửa">
                            <a-button type="link" @click="editTask(record.id)">
                                <edit-outlined />
                            </a-button>
                        </a-tooltip>
                        <!-- Nút Xóa -->
                        <a-tooltip title="Xóa">
                            <a-popconfirm
                                title="Bạn có chắc muốn xóa đầu việc này không?"
                                ok-text="Xóa"
                                cancel-text="Hủy"
                                @confirm="handleDeleteTask(record.id)"
                            >
                                <a-button type="link" danger>
                                    <delete-outlined />
                                </a-button>
                            </a-popconfirm>
                        </a-tooltip>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script>
import { getTasks, createTask, deleteTask } from "@/apis/tasks";
import { UserOutlined, AntDesignOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons-vue";
import { h } from "vue";
import { message } from "ant-design-vue";

export default {
    name: "PendingTasksAdd",
    components: {
        UserOutlined,
        AntDesignOutlined,
        DeleteOutlined,
        PlusOutlined,
        EditOutlined
    },
    mounted() {
        this.$message = message;
        this.loadTasks(); // Tải dữ liệu đầu việc khi component được mount
    },
    data() {
        return {
            loading: false,
            addTaskModalVisible: false, // Trạng thái hiển thị Modal
            searchKeyword: "",
            tasks: [], // Dữ liệu đầu việc từ API
            newTask: {
                task_name: "",
                assigned_to: "",
                priority: "Thấp",
                deadline: null,
                status: "Đang chờ xử lý",
                cancel_reason: "",
            }, // Dữ liệu đầu việc mới
            columns: [
                {
                    title: "Tên Đầu Việc",
                    dataIndex: "text",
                    key: "text",
                    customRender: ({ text, record }) => {
                        return h(
                            "a",
                            {
                                class: "clickable-cell",
                                onClick: () => this.viewTaskDetails(record.id),
                            },
                            text
                        );
                    },
                },
                {
                    title: "Người Phụ Trách",
                    dataIndex: "owner_details",
                    key: "owner_details",
                    customRender: ({ record }) => {
                        return h(
                            "a-avatar-group",
                            {}, // Thuộc tính của nhóm avatar
                            record.owner_details.map((owner, index) =>
                                h(
                                    "a",
                                    {
                                        key: index,
                                        href: "https://www.antdv.com", // URL liên kết (tùy chỉnh nếu cần)
                                        target: "_blank", // Mở liên kết trong tab mới
                                    },
                                    h(
                                        "a-avatar",
                                        {
                                            style: { backgroundColor: owner.backgroundColor || "#f56a00" }, // Sử dụng màu từ dữ liệu hoặc mặc định
                                        },
                                        owner.name.charAt(0).toUpperCase() // Lấy chữ cái đầu tiên của tên
                                    )
                                )
                            )
                        );
                    }
                },
                {
                    title: "Ưu Tiên",
                    dataIndex: "priority",
                    key: "priority",
                },
                {
                    title: "Hành Động",
                    key: "actions",
                },
            ],
        };
    },
    computed: {
        filteredTasks() {
            if (!this.searchKeyword) return this.tasks;
            return this.tasks.filter(
                (task) =>
                    task.task_name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    task.assigned_to.toLowerCase().includes(this.searchKeyword.toLowerCase())
            );
        },
    },
    methods: {
        generateRandomColor(name) {
            const colors = ["#f56a00", "#87d068", "#1890ff", "#ff4d4f", "#faad14"];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        async loadTasks() {
            try {
                this.loading = true;
                const tasks = await getTasks(); // Gọi API lấy danh sách đầu việc
                console.log('tasks', tasks)
                this.tasks = tasks;
            } catch (error) {
                this.$message.error("Không thể tải danh sách đầu việc.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        showAddTaskModal() {
            this.addTaskModalVisible = true;
        },
        async handleAddTask() {
            try {
                await createTask(this.newTask); // Gọi API thêm đầu việc
                message.success("Đầu việc mới đã được thêm thành công.");
                this.addTaskModalVisible = false; // Đóng Modal
                // Reset dữ liệu form
                this.newTask = {
                    task_name: "",
                    assigned_to: "",
                    priority: "Thấp",
                    deadline: null,
                    status: "Đang chờ xử lý",
                    cancel_reason: "",
                };
                await this.loadTasks(); // Tải lại danh sách đầu việc
            } catch (error) {
                message.error("Không thể thêm đầu việc mới.");
                console.error(error);
            }
        },
        async handleDeleteTask(id) {
            try {
                await deleteTask(id); // Gọi API xóa đầu việc
                this.tasks = this.tasks.filter((task) => task.id !== id);
                message.success("Đầu việc đã được xóa thành công.");
            } catch (error) {
                message.error("Không thể xóa đầu việc.");
                console.error(error);
            }
        },
        handleSearch(value) {
            this.searchKeyword = value;
        },
        editTask(id) {
            this.$router.push({ name: "PendingTasksEdit", params: { id } });
        },
        viewTaskDetails(id) {
            this.$router.push({ name: "PendingTaskDetail", params: { id } });
        },
        handleTableChange() {
            console.log('123')
        }
    },
};
</script>

<style scoped>
.tasks-list {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
</style>

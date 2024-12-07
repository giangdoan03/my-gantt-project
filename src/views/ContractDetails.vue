<template>
    <div>
        <a-card title="Chi tiết hợp đồng" bordered>
            <template #extra>
                <a-button type="primary" @click="navigateToGanttChart">
                    Xem Biểu Đồ Gantt
                </a-button>
            </template>
            <div>
                <template v-if="contract">
                    <a-table
                        :data-source="contractData"
                        :columns="columns"
                        bordered
                        :pagination="false"
                        row-key="key"
                    />
                </template>
                <template v-else>
                    <div class="loading-center">
                        <a-spin tip="Đang tải dữ liệu..." />
                    </div>
                </template>
            </div>
        </a-card>


        <div style="margin-top: 20px;">
            <a-card title="Công việc triển khai" bordered>
                <a-tree
                    :show-line="showLine"
                    :show-icon="showIcon"
                    :tree-data="treeData"
                    :expanded-keys="expandedKeys"
                    @select="onSelect"
                />
            </a-card>
        </div>

        <!-- Popup hiển thị thông tin -->
<!--  tắt đóng mở modal      :maskClosable="false"-->
        <a-modal
            v-model:open="isModalVisible"
            title="Chi tiết Công Việc"
            @ok="closeModal"
            @cancel="closeModal"
            width="1000px"
            centered
        >
            <!-- Thông tin công việc -->
            <p><strong>Tên công việc:</strong> {{ selectedTask?.title }}</p>
            <p><strong>Mã công việc:</strong> {{ selectedTask?.key }}</p>

            <!-- Form Upload -->
            <a-divider>Upload Tệp Liên Quan</a-divider>
            <a-upload
                v-model:file-list="fileList"
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                list-type="picture-card"
                @preview="handlePreview"
            >
                <div v-if="fileList.length < 8">
                    <plus-outlined />
                    <div style="margin-top: 8px">Upload</div>
                </div>
            </a-upload>

            <!-- Xem trước hình ảnh -->
            <a-modal
                v-model:open="isPreviewVisible"
                title="Xem Trước"
                :footer="null"
                @cancel="handlePreviewCancel"
            >
                <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>

            <!-- Bình luận -->
            <a-divider>Bình luận</a-divider>
            <a-list
                v-if="comments.length"
                :data-source="comments"
                :header="`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`"
                item-layout="horizontal"
            >
                <template #renderItem="{ item }">
                    <a-list-item>
                        <a-comment
                            :author="item.author"
                            :content="item.content"
                            :datetime="item.datetime"
                        >
                            <template #avatar>
                                <a-avatar :style="{ backgroundColor: getRandomColor() }">
                                    {{ getRandomLetter(item.author) }}
                                </a-avatar>
                            </template>
                        </a-comment>
                    </a-list-item>
                </template>
            </a-list>
            <a-comment>
                <template #avatar>
                    <a-avatar :style="{ backgroundColor: randomColor }">
                        {{ randomLetter }}
                    </a-avatar>
                </template>
                <template #content>
                    <a-form-item>
                        <a-textarea v-model:value="value" :rows="4" />
                    </a-form-item>
                    <a-form-item>
                        <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit">
                            Add Comment
                        </a-button>
                    </a-form-item>
                </template>
            </a-comment>
        </a-modal>
    </div>
</template>
<script lang="js">
import { fetchContractDetails } from "@/apis/contracts";
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default {
    name: "ContractDetails",
    props: ["id"],
    data() {
        return {
            contract: null, // Dữ liệu hợp đồng
            treeData: [], // Dữ liệu cây cho a-tree
            expandedKeys: [], // Danh sách các key của node được mở
            showLine: true, // Hiển thị đường kẻ trong cây
            showIcon: false, // Hiển thị icon trong cây
            isModalVisible: false, // Trạng thái hiển thị modal
            selectedTask: null, // Dữ liệu công việc được chọn
            selectedKey: null, // Hoặc _selectedKey nếu muốn bỏ qua ESLint

            isPreviewVisible: false, // Hiển thị modal xem trước
            fileList: [
                {
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                },
                {
                    uid: '-2',
                    name: 'image.png',
                    status: 'done',
                    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                },
            ],
            previewImage: '', // Hình ảnh xem trước
            comments: [
                {
                    author: "Han Solo",
                    content: "This is a comment",
                    datetime: "10 minutes ago",
                    avatar: "", // Không có ảnh
                },
                {
                    author: "Leia Organa",
                    content: "Another comment",
                    datetime: "5 minutes ago",
                    avatar: "", // Không có ảnh
                },
            ], // Danh sách bình luận
            value: '', // Nội dung bình luận mới
            submitting: false, // Trạng thái gửi bình luận

            randomLetter: this.getRandomLetter(), // Lưu chữ cái ngẫu nhiên
            randomColor: this.getRandomColor(), // Lưu màu nền ngẫu nhiên

            columns: [
                {
                    title: "Thông tin",
                    dataIndex: "label",
                    key: "label",
                },
                {
                    title: "Chi tiết",
                    dataIndex: "value",
                    key: "value",
                    customRender: (record) => {
                        if (record.key === "status") {
                            return `<span class="status-tag ${record.value === 'closed' ? 'status-active' : 'status-closed'}">${record.value === 'closed' ? 'closed' : 'Closed'}</span>`;
                        }
                        return record.value;
                    },
                },
            ],

        };
    },

    computed: {
        // Dữ liệu hợp đồng chuyển thành data source cho bảng
        contractData() {
            return [
                { key: "1", label: "Mã hợp đồng", value: this.contract.contract_code },
                { key: "2", label: "Tên hợp đồng", value: this.contract.contract_name },
                { key: "3", label: "Ngày bắt đầu", value: this.contract.start_date },
                { key: "4", label: "Ngày kết thúc", value: this.contract.end_date || "Chưa kết thúc" },
                { key: "5", label: "Tổng giá trị", value: this.contract.total_amount },
                {
                    key: "6",
                    label: "Trạng thái",
                    value: this.contract.status, // Chỉ lưu trạng thái (active/closed)
                },
            ];
        },
        // Cấu hình cột
        // columns() {
        //     return [
        //         { title: "Thông tin", dataIndex: "label", key: "label" },
        //         {
        //             title: "Giá trị",
        //             dataIndex: "value",
        //             key: "value",
        //             customCell: ({ record }) => {
        //                 if (record.label === "Trạng thái") {
        //                     return {
        //                         style: {}, // Bạn có thể tùy chỉnh style nếu cần
        //                         children: (
        //                             <a-tag color={record.value === "active" ? "green" : "red"}>
        //                                 {record.value === "active" ? "Active" : "Closed"}
        //                             </a-tag>
        //                         ),
        //                     };
        //                 }
        //                 return {
        //                     children: record.value, // Trả về giá trị thông thường
        //                 };
        //             },
        //         },
        //     ];
        // }


    },

    components: {
        PlusOutlined,
    },

    methods: {
        // Hàm lấy một chữ cái in hoa ngẫu nhiên
        getRandomLetter() {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return letters.charAt(Math.floor(Math.random() * letters.length));
        },
        // Hàm lấy một màu ngẫu nhiên
        getRandomColor() {
            const colors = [
                "#f56a00",
                "#7265e6",
                "#ffbf00",
                "#00a2ae",
                "#87d068",
                "#1890ff",
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        // Gọi API để lấy thông tin hợp đồng và xây dựng dữ liệu cây
        async fetchContractDetailsAndTasks() {
            try {
                const contract = await fetchContractDetails(this.id); // Gọi API
                this.contract = contract; // Lưu thông tin hợp đồng
                if (contract && contract.tasks) {
                    // Xây dựng dữ liệu cây từ danh sách task
                    this.treeData = this.buildTree(contract.tasks);
                    // Lấy tất cả key để mở rộng node
                    this.expandedKeys = this.getAllKeys(contract.tasks);
                }
            } catch (error) {
                console.error("Failed to fetch contract details:", error);
                this.$message.error("Không thể tải thông tin hợp đồng!");
            }
        },

        // Chuyển đổi danh sách phẳng thành cấu trúc cây
        buildTree(tasks, parent = "0") {
            return tasks
                .filter(task => task.parent === parent) // Lọc các node con
                .map(task => ({
                    title: task.text, // Hiển thị tên node
                    key: task.id, // ID duy nhất của node
                    children: this.buildTree(tasks, task.id), // Đệ quy tìm các node con
                }));
        },

        // Lấy tất cả key của các node để mở rộng
        getAllKeys(tasks) {
            return tasks.map(task => task.id); // Trả về danh sách tất cả các ID
        },

        // Sự kiện khi chọn node trong cây
        onSelect(selectedKeys, info) {
            // const selectedKey = selectedKeys[0]; // Lấy key của node được chọn
            const selectedNode = info.node; // Node được chọn
            this.selectedTask = {
                title: selectedNode.title,
                key: selectedNode.key,
            }; // Lưu thông tin node được chọn
            this.isModalVisible = true; // Hiển thị modal
        },

        // Đóng modal
        closeModal() {
            this.isModalVisible = false;
        },

        // Điều hướng sang trang Gantt Chart
        navigateToGanttChart() {
            this.$router.push({ name: "SalesContract" });
        },
        // Xử lý khi xem trước tệp
        async handlePreview(file) {
            if (!file.url && !file.preview) {
                file.preview = await this.getBase64(file.originFileObj);
            }
            this.previewImage = file.url || file.preview;
            this.isPreviewVisible = true;
        },
        // Đóng modal xem trước
        handlePreviewCancel() {
            this.isPreviewVisible = false;
        },
        // Chuyển đổi file sang Base64
        getBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        },
        handleSubmit() {
            if (!this.value) {
                return;
            }
            this.submitting = true;
            setTimeout(() => {
                this.submitting = false;
                this.comments.unshift({
                    author: 'Han Solo',
                    avatar: 'https://joeschmoe.io/api/v1/random',
                    content: this.value,
                    datetime: dayjs().fromNow(),
                });
                this.value = '';
            }, 1000);
        },
    },
    created() {
        this.fetchContractDetailsAndTasks(); // Gọi API khi component được tạo
    },
};
</script>



<style scoped>
.table-actions {
    margin-top: 16px;
    text-align: right;
}

.loading-center {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}
/* Định nghĩa chung cho trạng thái */
.status-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    color: #fff;
    font-weight: bold;
    display: inline-block;
    text-align: center;
}

/* Màu cho trạng thái Active */
.status-active {
    background-color: #52c41a; /* Màu xanh lá */
}

/* Màu cho trạng thái Closed */
.status-closed {
    background-color: #f5222d; /* Màu đỏ */
}
</style>

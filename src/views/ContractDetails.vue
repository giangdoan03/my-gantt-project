<template>
    <div>
        <a-card title="Chi tiết hợp đồng" bordered>
            <template #extra>
                <a-button type="default" @click="goBackToContracts" class="back-button">
                    Quay lại danh sách hợp đồng
                </a-button>
                <a-button type="primary" @click="navigateToGanttChart">
                    Xem Biểu Đồ Gantt
                </a-button>
            </template>
            <div>
                <template v-if="contract">
                    <a-descriptions bordered :column="1">
                        <a-descriptions-item label="Mã hợp đồng">
                            {{ contract.contract_code }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Tên hợp đồng">
                            {{ contract.contract_name }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Ngày bắt đầu">
                            {{ contract.start_date }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Ngày kết thúc">
                            {{ contract.end_date || "Chưa kết thúc" }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Tổng giá trị">
                            {{ contract.total_amount }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Trạng thái">
                            <a-tag color="green" v-if="contract.status === 'active'">Active</a-tag>
                            <a-tag color="red" v-else>Closed</a-tag>
                        </a-descriptions-item>
                    </a-descriptions>
                </template>
                <template v-else>
                    <div class="loading-center">
                        <a-spin tip="Đang tải dữ liệu..."/>
                    </div>
                </template>
            </div>
        </a-card>


        <div style="margin-top: 20px;">
            <div>
                <a-card title="Kế hoạch triển khai - Tổng hợp file báo cáo" bordered>
                    <!--                    <template #extra>-->
                    <!--                        <a-button type="primary" @click="navigateToGanttChart">-->
                    <!--                            Xem Biểu Đồ Gantt-->
                    <!--                        </a-button>-->
                    <!--                    </template>-->
                    <!--                    <a-tree-->
                    <!--                        :show-line="showLine"-->
                    <!--                        :show-icon="showIcon"-->
                    <!--                        :tree-data="treeData"-->
                    <!--                        :expanded-keys="expandedKeys"-->
                    <!--                        @select="onSelect"-->
                    <!--                    />-->
                    <a-row gutter={16}>
                        <a-col :span="12">
                            <a-table :row-selection="rowSelection" :columns="columns2" :data-source="tasks">
                                <template #bodyCell="{ column, text }">
                                    <template v-if="column.dataIndex === 'text'">
                                        <a>{{ text }}</a>
                                    </template>
                                </template>
                            </a-table>
                        </a-col>

                        <a-col :span="12">
                            <Draggable class="mtl-tree" v-model="treeData2" treeLine>
                                <template #default="{ node, stat }">
                                    <OpenIcon
                                        v-if="stat.children.length"
                                        :open="stat.open"
                                        class="mtl-mr"
                                        @click="stat.open = !stat.open"
                                    />
                                    <input
                                        class="mtl-checkbox mtl-mr"
                                        type="checkbox"
                                        v-model="stat.checked"
                                    />
                                    <div class="info-right" @click="showPopup(node)">
                                        <folder-outlined />
                                        <span class="mtl-ml w-100">{{ node.text }}</span>
                                    </div>
                                </template>
                            </Draggable>
                        </a-col>
                    </a-row>
                </a-card>
            </div>
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
                    <plus-outlined/>
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
                <img alt="example" style="width: 100%" :src="previewImage"/>
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
                        <a-textarea v-model:value="value" :rows="4"/>
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
import {fetchContractDetails} from "@/apis/contracts";
import {FolderOutlined, PlusOutlined} from '@ant-design/icons-vue';
import gantt from "@/assets/js/dhtmlxgantt.js";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {Draggable, OpenIcon} from '@he-tree/vue'
import '@he-tree/vue/style/default.css'
import '@he-tree/vue/style/material-design.css'
import {getTemporaryTasks} from "@/apis/tasks";

dayjs.extend(relativeTime);

export default {
    name: "ContractDetails",
    props: ["id"],

    components: {
        PlusOutlined,
        Draggable,
        OpenIcon,
        FolderOutlined,
    },
    data() {
        return {
            contract: null, // Dữ liệu hợp đồng
            treeData: [], // Dữ liệu cây cho a-tree
            treeData2: [], // Dữ liệu cây cho a-tree
            expandedKeys: [], // Danh sách các key của node được mở
            showLine: true, // Hiển thị đường kẻ trong cây
            showIcon: false, // Hiển thị icon trong cây
            isModalVisible: false, // Trạng thái hiển thị modal
            selectedTask: null, // Dữ liệu công việc được chọn
            selectedKey: null, // Hoặc _selectedKey nếu muốn bỏ qua ESLint

            tasks: '',

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

            rowSelection: {
                onChange: (selectedRowKeys, selectedRows) => {
                    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                },
                getCheckboxProps: (record) => ({
                    disabled: record.name === 'Disabled User',
                    name: record.name,
                }),
            },
            columns2: [
                {
                    title: 'Tên đầu việc',
                    dataIndex: 'text', // This refers to the task name
                    key: 'text',
                },
                {
                    title: 'Nội dung',
                    dataIndex: 'description', // This will be custom content you can add
                    key: 'description',
                    render: (text, record) => {
                        // You can return a custom description based on your task data
                        return `Priority: ${record.priority.label}, Status: ${record.status}`;
                    }
                }
            ],
        };
    },

    created() {
        this.fetchContractDetailsAndTasks(); // Gọi API khi component được tạo
    },

    mounted() {
        // Tự động gọi khi component được mount
        this.autoSelectTaskFromUrl();
        this.loadTasks(); // Tải dữ liệu đầu việc khi component được mount
    },

    computed: {
        // Dữ liệu hợp đồng chuyển thành data source cho bảng
    },

    methods: {
        async loadTasks() {
            try {
                this.loading = true;
                const tasks = await getTemporaryTasks(); // Gọi API lấy danh sách đầu việc
                console.log('tasks', tasks)
                this.tasks = tasks;
            } catch (error) {
                this.$message.error("Không thể tải danh sách đầu việc.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
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

        // Lấy tham số task từ URL
        getTaskFromUrl() {
            const params = new URLSearchParams(window.location.search);
            console.log('params', params)
            return params.get("task"); // Lấy giá trị của task
        },

        // Gọi API để lấy thông tin hợp đồng và xây dựng dữ liệu cây
        async fetchContractDetailsAndTasks() {
            try {
                const contract = await fetchContractDetails(this.id); // Gọi API
                this.contract = contract; // Lưu thông tin hợp đồng
                if (contract && contract.tasks) {
                    // Xây dựng dữ liệu cây từ danh sách task
                    this.treeData = this.buildTree(contract.tasks);
                    this.treeData2 = this.buildTree2(contract.tasks);
                    console.log('treeData', this.treeData)
                    console.log('treeData2', this.treeData2)
                    // Lấy tất cả key để mở rộng node
                    this.expandedKeys = this.getAllKeys(contract.tasks);

                    // Gọi autoSelectTaskFromUrl sau khi treeData đã được thiết lập
                    this.autoSelectTaskFromUrl();
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

        buildTree2(tasks, parent = "0") {
            return tasks
                .filter(task => task.parent === parent) // Lọc các node con
                .map(task => ({
                    text: task.text, // Hiển thị tên node
                    key: task.id, // ID duy nhất của node
                    children: this.buildTree(tasks, task.id), // Đệ quy tìm các node con
                }));
        },

        // Lấy tất cả key của các node để mở rộng
        getAllKeys(tasks) {
            return tasks.map(task => task.id); // Trả về danh sách tất cả các ID
        },

        getAllKeysAuto(tasks) {
            const keys = [];
            const traverse = (nodes) => {
                nodes.forEach((node) => {
                    keys.push(node.key); // Thêm key của node hiện tại
                    if (node.children && node.children.length > 0) {
                        traverse(node.children); // Duyệt các node con
                    }
                });
            };
            traverse(tasks); // Bắt đầu duyệt từ gốc
            return keys;
        },

        // Sự kiện khi chọn node trong cây
        onSelect(selectedKeys, info) {
            const selectedNode = info.node; // Node được chọn
            this.selectedTask = {
                title: selectedNode.title,
                key: selectedNode.key,
            }; // Lưu thông tin node được chọn
            this.isModalVisible = true; // Hiển thị modal
        },

        showPopup(node) {
            this.selectedTask = {
                title: node.text,
                key: node.key,
            }; // Lưu thông tin node được chọn
            this.isModalVisible = true; // Hiển thị modal
        },

        findNodeByKey(tree, key) {
            for (const node of tree) {
                if (node.key === key) {
                    return node; // Tìm thấy node
                }
                if (node.children && node.children.length > 0) {
                    const childNode = this.findNodeByKey(node.children, key);
                    if (childNode) {
                        return childNode; // Tìm thấy node trong cấp con
                    }
                }
            }
            return null; // Không tìm thấy
        },
        // Hàm tự động select node dựa vào query string
        autoSelectTaskFromUrl() {
            const task = this.$route.query.task; // Lấy giá trị task từ query string
            if (task) {
                this.isModalVisible = true; // Hiển thị modal
                // Dùng hàm đệ quy để tìm node
                const taskNode = this.findNodeByKey(this.treeData, task);
                if (taskNode) {
                    // Mở rộng key và gọi sự kiện onSelect
                    this.expandedKeys = this.getAllKeysAuto(this.treeData); // Mở rộng toàn bộ cây

                    // Mô phỏng thông tin giống `info.node` từ onSelect
                    this.selectedTask = {
                        title: taskNode.title,
                        key: taskNode.key,
                    }; // Lưu thông tin node được chọn
                    console.log("Thông tin task được chọn:", this.selectedTask);
                } else {
                    console.warn("Task không tồn tại trong treeData:", task);
                }
            }
        }
        ,
        // Đóng modal
        closeModal() {
            this.isModalVisible = false;
        },

        // Điều hướng quay lại danh sách hợp đồng
        goBackToContracts() {
            this.$router.push({path: "/dashboard/contracts"}); // Điều hướng về danh sách hợp đồng
        },

        // Điều hướng sang trang Gantt Chart
        navigateToGanttChart() {
            const contractId = this.$route.params.id; // Lấy contract ID từ URL hiện tại
            if (contractId) {
                this.reloadGanttData();
                this.$router.push({name: "SalesContract", params: {id: contractId}});
            } else {
                console.error("Contract ID not found in the URL.");
            }
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

        async reloadGanttData() {
            try {
                const contractId = this.$route.params.id;
                this.contract_details = await fetchContractDetails(contractId);
                // Nạp dữ liệu vào Gantt
                gantt.clearAll(); // Xóa dữ liệu cũ
                gantt.parse({data: this.contract_details.tasks}); // Nạp dữ liệu mới
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                this.loading = false; // Kết thúc trạng thái loading
            }
        },
    },
};
</script>


<style>
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

.back-button {
    margin-right: 10px;
}

/* Toàn bộ container của Tree */
.vtlist {
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #333;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 10px;
    border: 1px solid #ddd;
    overflow: auto;
}

/* Node cơ bản */
.tree-node {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 10px;
    transition: all 0.3s ease;
}

/* Đường kết nối ngang và dọc giữa các node */


/* Node nội dung */
.tree-node-inner {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 0;
    border-radius: 5px;
    transition: all 0.3s ease;
    width: 100%;
}

.tree-node-inner:hover {
    background-color: #f0f0f0;
}

/* Icon mở rộng / thu nhỏ */
.he-tree__open-icon {
    margin-right: 5px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

/* Icon mặc định */
.tree-node-inner .anticon {
    font-size: 16px;
    color: #555;
}

/* Checkbox */
.mtl-checkbox {
    margin-right: 12px;
    width: 16px;
    height: 16px;
    cursor: pointer;
}

/* Text */
.mtl-checkbox {
    margin-right: 10px;
}

.mtl-ml {
    margin-left: 5px;
    color: #333;
    font-weight: 500;
}

.info-right {
    width: 100%;
}

/* Highlight node khi được chọn */
.tree-node-inner.selected {
    background-color: #d9f7be;
    border: 1px solid #91d5ff;
}

/* Styling scrollbar cho Tree View */
.vtlist::-webkit-scrollbar {
    width: 8px;
}

.vtlist::-webkit-scrollbar-thumb {
    background-color: #bbb;
    border-radius: 4px;
}

.vtlist::-webkit-scrollbar-thumb:hover {
    background-color: #888;
}

.vtlist::-webkit-scrollbar-track {
    background-color: #f1f1f1;
}

.custom-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.custom-list-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
}

.custom-list-item.disabled {
    color: #ccc;
    cursor: not-allowed;
}


</style>

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
                            {{ formatNumber(contract.total_amount) }}
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
                    <a-row :gutter='16' style="justify-content: space-between">
                        <a-col :span="11">
                            <p>
                                <a-tag class="title_tag" color="#2db7f5">
                                    <Unordered-list-outlined />
                                    <strong> Đầu việc chờ</strong>
                                </a-tag>
                            </p>
                            <a-divider />
                            <a-table :row-selection="rowSelection" :columns="columns" :data-source="listTasksTemporary" bordered>
                                <template #bodyCell="{ column, record }">
                                    <template v-if="column.dataIndex === 'text'">
                                        <a>{{ record.text }}</a>
                                    </template>

                                    <!-- Cột Owner Details (Nhóm Avatar) -->
                                    <template v-else-if="column.dataIndex === 'owner_details'">
                                        <a-avatar-group>
                                            <!-- Hiển thị từng avatar -->
                                            <template v-for="(owner, index) in record.owner_details" :key="index">
                                                <!-- Tooltip bao quanh Avatar -->
                                                <a-tooltip :title="owner.name">
                                                    <!-- Avatar với hình ảnh -->
                                                    <a-avatar
                                                        v-if="owner.type === 'image'"
                                                        :src="owner.src"
                                                    />

                                                    <!-- Avatar với chữ -->
                                                    <a-avatar
                                                        v-else-if="owner.type === 'text'"
                                                        :style="{ backgroundColor: owner.backgroundColor }"
                                                    >
                                                        {{ owner.name.charAt(0).toUpperCase() }}
                                                    </a-avatar>
                                                </a-tooltip>
                                            </template>
                                        </a-avatar-group>
                                    </template>
                                    <!-- Cột Trạng Thái -->
                                    <template v-else-if="column && column.dataIndex === 'status'">
                                        <a-tag
                                            :color="getStatusColor(record.status)"
                                            style="text-transform: capitalize;"
                                        >
                                            {{ record.status }}
                                        </a-tag>
                                    </template>

                                </template>
                            </a-table>
                        </a-col>
                        <a-col :span="2" style="display: flex; justify-content: center; align-items: center;">
                            <div>
                                <a-button
                                    style="margin-bottom: 10px"
                                    :loading="loading"
                                    @click="updateTasksStatus(0)">
                                    <swap-right-outlined />
                                </a-button>
                                <br>
                                <a-button
                                    :loading="loading"
                                    @click="updateTasksStatus(1)">
                                    <swap-left-outlined/>
                                </a-button>
                            </div>
                        </a-col>
                        <a-col :span="10">
                            <p style="display: flex; justify-content: space-between; align-items: center;">
                                <a-tag class="title_tag" color="#2db7f5">
                                    <span><Unordered-list-outlined />
                                    <strong style="margin-left: 3px">Đầu việc trong hợp đồng</strong></span>
                                </a-tag>

                                <a-button @click="navigateToGanttChart">
                                    <BarChartOutlined />
                                    Xem Biểu Đồ Gantt
                                </a-button>
                            </p>
                            <a-divider />
<!--                            Checked: {{ checked }}-->
                            <a-card bordered>
                                <Draggable class="mtl-tree" v-model="treeData" ref="tree" @check:node="onCheckNode" @change="onDragChange"  treeLine>
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
                                            <span class="mtl-ml w-100">{{ node.text }}</span>
                                        </div>
                                    </template>
                                </Draggable>
                            </a-card>
                        </a-col>
                    </a-row>
                </a-card>
            </div>
        </div>

        <!-- Popup hiển thị thông tin -->
        <!--  tắt đóng mở modal :maskClosable="false"-->
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
import { UnorderedListOutlined, PlusOutlined, SwapLeftOutlined, BarChartOutlined, SwapRightOutlined} from '@ant-design/icons-vue';
import gantt from "@/assets/js/dhtmlxgantt.js";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {Draggable, OpenIcon} from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';
import { getOfficialTasks , getTemporaryTasks, updateTasksStatus, saveTaskOrder} from "@/apis/tasks";
// import { getOfficialTasks , getTemporaryTasks} from "@/apis/tasks";
import {h} from "vue";

dayjs.extend(relativeTime);

export default {
    name: "ContractDetails",
    props: ["id"],

    components: {
        PlusOutlined,
        Draggable,
        OpenIcon,
        UnorderedListOutlined,
        SwapRightOutlined,
        SwapLeftOutlined,
        BarChartOutlined
    },
    data() {
        return {
            contract: null, // Dữ liệu hợp đồng
            treeData: [], // Dữ liệu cây cho a-tree
            showLine: true, // Hiển thị đường kẻ trong cây
            showIcon: false, // Hiển thị icon trong cây
            isModalVisible: false, // Trạng thái hiển thị modal
            selectedTask: null, // Dữ liệu công việc được chọn
            selectedKey: null, // Hoặc _selectedKey nếu muốn bỏ qua ESLint
            listTasksTemporary: [],
            isPreviewVisible: false, // Hiển thị modal xem trước
            loading: false,
            selectedRowKeys: [],
            selectedTaskIds: [], // Lưu các giá trị đã check
            // checked: [],
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

            rowSelection: {
                onChange: (selectedRowKeys, selectedRows) => {
                    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    this.selectedRowKeys = selectedRowKeys;  // Cập nhật selectedRowKeys vào state của component
                },
                getCheckboxProps: (record) => ({
                    disabled: record.name === 'Disabled User',
                    name: record.name,
                }),
            },
            columns: [
                {
                    title: 'Tên đầu việc',
                    dataIndex: 'text', // This refers to the task name
                    key: 'text',
                },
                {
                    title: "Thực hiện",
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
                    title: 'Ngày tạo',
                    dataIndex: 'start_date',
                    key: 'start_date',
                    render: (value) => {
                        // Định dạng ngày thành dd-MM-yyyy
                        return dayjs(value).format('DD-MM-YYYY');
                    },
                },
                {
                    title: "Trạng Thái",
                    dataIndex: "status",
                    key: "status",
                },
            ],
        };
    },

    created() {
        this.fetchContractDetailsAndTasks();
        this.loadTemporaryTasks(); // Tải dữ liệu đầu việc khi component được mount
        this.getOfficialTasks(); // Gọi API khi component được tạo
    },

    mounted() {
        // Tự động gọi khi component được mount
        this.autoSelectTaskFromUrl();
    },

    watch: {

    },

    computed: {
        // Dữ liệu hợp đồng chuyển thành data source cho bảng
    },

    methods: {
        onCheckNode() {
            this.checked = this.$refs.tree.getChecked().map((v) => v.data.key);
        },
        formatNumber(value) {
            return new Intl.NumberFormat('vi-VN').format(value);
        },
        getStatusColor(status) {
            switch (status) {
                case "pending":
                    return "orange"; // Màu Ant Design Vue
                case "in-progress":
                    return "blue"; // Màu Ant Design Vue
                case "completed":
                    return "green"; // Màu Ant Design Vue
                case "cancelled":
                    return "red"; // Màu Ant Design Vue
                default:
                    return "default"; // Mặc định
            }
        },
        async loadTemporaryTasks() {
            try {
                this.loading = true;
                const tasks = await getTemporaryTasks(); // Gọi API lấy danh sách đầu việc
                console.log('tasksxxx', tasks)
                // Thêm key duy nhất vào mỗi task
                this.listTasksTemporary = tasks;

                console.log('this.tasks', this.listTasksTemporary)
            } catch (error) {
                this.$message.error("Không thể tải danh sách đầu việc.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async getOfficialTasks() {
            try {
                this.loading = true;
                const tasks = await getOfficialTasks(); // Gọi API lấy danh sách đầu việc
                const sortedTasks = tasks.sort((a, b) => a.wbs.localeCompare(b.wbs)); // Sắp xếp theo WBS nếu cần
                this.treeData = this.buildTree(sortedTasks); // Xây dựng cấu trúc cây
                console.log("treeData", this.treeData);
            } catch (error) {
                this.$message.error("Không thể tải danh sách đầu việc.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        // Chuyển đổi danh sách phẳng thành cấu trúc cây
        buildTree(tasks, parent = "0") {
            // Lọc các node con của parent hiện tại
            const children = tasks
                .filter(task => task.parent === parent)
                .sort((a, b) => a.sort_order - b.sort_order); // Sắp xếp theo sort_order

            // Xây dựng cấu trúc cây
            return children.map(task => ({
                text: task.text, // Hiển thị tên của node
                key: task.id, // ID duy nhất của node
                wbs: task.wbs, // Thêm WBS nếu cần hiển thị
                children: this.buildTree(tasks, task.id), // Đệ quy tìm các node con
            }));
        },
        // Hàm gọi API để cập nhật trạng thái task
        async updateTasksStatus(isTemporary) {
            // console.log('this.checked', this.checked)
            // console.log('this.selectedRowKeys',this.selectedRowKeys);
            console.log(isTemporary)
            if (isTemporary === 1 && this.checked.length > 0) {
                this.selectedRowKeys = this.checked;
            }
            if (this.selectedRowKeys.length === 0) {
                this.$message.warning('Vui lòng chọn ít nhất một task!');
                return;
            }
            try {
                this.loading = true;
                const response = await updateTasksStatus(this.selectedRowKeys, isTemporary);  // Truyền isTemporary (1 hoặc 0)
                if (response.success) {
                    this.$message.success('Cập nhật trạng thái thành công!');
                    await this.loadTemporaryTasks();
                    await this.getOfficialTasks();
                } else {
                    this.$message.error('Cập nhật trạng thái thất bại!');
                }
            } catch (error) {
                this.$message.error('Có lỗi xảy ra khi cập nhật trạng thái.');
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async onDragChange() {
            try {
                this.loading = true;
                const flatData = this.flattenTree(this.treeData); // Chuyển cây về danh sách phẳng
                await saveTaskOrder(flatData); // Gửi danh sách lên backend
                this.$message.success("Cập nhật vị trí thành công!");
            } catch (error) {
                this.$message.error("Cập nhật vị trí thất bại.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        flattenTree(tree, parent = "0") {
            // Chuyển cấu trúc cây về danh sách phẳng với thông tin parent và thứ tự
            const result = [];
            tree.forEach((node, index) => {
                result.push({
                    id: node.key,
                    parent,
                    sort_order: index + 1, // Thứ tự mới
                });
                if (node.children) {
                    result.push(...this.flattenTree(node.children, node.key));
                }
            });
            return result;
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


        // Gọi API để lấy thông tin hợp đồng và xây dựng dữ liệu cây
        async fetchContractDetailsAndTasks() {
            try {
                this.contract = await fetchContractDetails(this.id);
            } catch (error) {
                console.error("Failed to fetch contract details:", error);
                this.$message.error("Không thể tải thông tin hợp đồng!");
            }
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
        },
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

a {
    color: #000000;
}
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

.title_tag {
    line-height: 32px;
}

</style>

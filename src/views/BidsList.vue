<template>
    <div class="bids-list">
        <!-- Tiêu đề và thanh công cụ -->
        <div class="header">
            <h2>Danh Sách Gói Thầu</h2>
            <a-input-search
                v-model:value="searchKeyword"
                placeholder="Tìm kiếm gói thầu..."
                @search="handleSearch"
                style="width: 300px"
            />
            <a-button type="primary" @click="showAddBidModal">
                <plus-outlined />
                Thêm Gói Thầu
            </a-button>
        </div>

        <!-- Modal Thêm Gói Thầu -->
        <a-modal
            v-model:open="addBidModalVisible"
            title="Thêm Gói Thầu"
            ok-text="Lưu"
            cancel-text="Hủy"
            width="1000px"
            centered
            @ok="handleAddBid"
        >
            <a-form :model="newBid" :layout="'vertical'" ref="addBidForm">
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Dự Án" :rules="[{ required: true, message: 'Vui lòng nhập tên dự án!' }]">
                            <a-input v-model:value="newBid.project_name" placeholder="Nhập tên dự án" />
                        </a-form-item>
                        <a-form-item label="Tổ Chức Mời Thầu" :rules="[{ required: true, message: 'Vui lòng nhập tổ chức mời thầu!' }]">
                            <a-input v-model:value="newBid.organization" placeholder="Nhập tổ chức mời thầu" />
                        </a-form-item>
                        <a-form-item label="Giá Trị Dự Thầu" :rules="[{ required: true, message: 'Vui lòng nhập giá trị dự thầu!' }]">
                            <a-input-number
                                v-model:value="newBid.bid_amount"
                                placeholder="Nhập giá trị dự thầu"
                                style="width: 100%;"
                            />
                        </a-form-item>
                        <a-form-item label="Ngày Nộp Hồ Sơ" :rules="[{ required: true, message: 'Vui lòng chọn ngày!' }]">
                            <a-date-picker v-model:value="newBid.submission_date" placeholder="Chọn ngày nộp hồ sơ" format="YYYY-MM-DD" />
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Trạng Thái" :rules="[{ required: true, message: 'Vui lòng chọn trạng thái!' }]">
                            <a-select v-model:value="newBid.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Đang xét duyệt">Đang xét duyệt</a-select-option>
                                <a-select-option value="Đã trúng thầu">Đã trúng thầu</a-select-option>
                                <a-select-option value="Không trúng thầu">Không trúng thầu</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item v-if="newBid.status === 'Không trúng thầu'" label="Lý Do Không Trúng Thầu">
                            <a-input v-model:value="newBid.reason" placeholder="Nhập lý do không trúng thầu" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>

        <!-- Bảng gói thầu -->
        <a-table
            :columns="columns"
            :data-source="filteredBids"
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
                            <a-button type="link" @click="editBid(record.id)">
                                <edit-outlined />
                            </a-button>
                        </a-tooltip>
                        <!-- Nút Xóa -->
                        <a-tooltip title="Xóa">
                            <a-popconfirm
                                title="Bạn có chắc muốn xóa gói thầu này không?"
                                ok-text="Xóa"
                                cancel-text="Hủy"
                                @confirm="handleDeleteBid(record.id)"
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
import { fetchBids, createBid, deleteBid } from "@/apis/bids";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { h } from "vue";
import { message } from "ant-design-vue";

export default {
    name: "BidsList",
    components: {
        EditOutlined,
        DeleteOutlined,
        PlusOutlined,
    },
    mounted() {
        this.$message = message;
        this.loadBids(); // Tải dữ liệu gói thầu khi component được mount
    },
    data() {
        return {
            loading: false,
            addBidModalVisible: false, // Trạng thái hiển thị Modal
            searchKeyword: "",
            bids: [], // Dữ liệu gói thầu từ API
            newBid: {
                project_name: "",
                organization: "",
                bid_amount: null,
                submission_date: null,
                status: "Đang xét duyệt",
                reason: "",
            }, // Dữ liệu gói thầu mới
            columns: [
                {
                    title: "Tên Dự Án",
                    dataIndex: "project_name",
                    key: "project_name",
                    customRender: ({ text, record }) => {
                        return h(
                            "a",
                            {
                                class: "clickable-cell",
                                onClick: () => this.viewBidDetails(record.id),
                            },
                            text
                        );
                    },
                },
                {
                    title: "Tổ Chức Mời Thầu",
                    dataIndex: "organization",
                    key: "organization",
                },
                {
                    title: "Giá Trị Dự Thầu",
                    dataIndex: "bid_amount",
                    key: "bid_amount",
                },
                {
                    title: "Hành Động",
                    key: "actions",
                },
            ],
        };
    },
    computed: {
        filteredBids() {
            if (!this.searchKeyword) return this.bids;
            return this.bids.filter(
                (bid) =>
                    bid.project_name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    bid.organization.toLowerCase().includes(this.searchKeyword.toLowerCase())
            );
        },
    },
    methods: {
        async loadBids() {
            try {
                this.loading = true;
                const bids = await fetchBids(); // Gọi API lấy danh sách gói thầu
                this.bids = bids;
            } catch (error) {
                this.$message.error("Không thể tải danh sách gói thầu.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        showAddBidModal() {
            this.addBidModalVisible = true;
        },
        async handleAddBid() {
            try {
                await createBid(this.newBid); // Gọi API thêm gói thầu
                message.success("Gói thầu mới đã được thêm thành công.");
                this.addBidModalVisible = false; // Đóng Modal
                // Reset dữ liệu form
                this.newBid = {
                    project_name: "",
                    organization: "",
                    bid_amount: null,
                    submission_date: null,
                    status: "Đang xét duyệt",
                    reason: "",
                };
                await this.loadBids(); // Tải lại danh sách gói thầu
            } catch (error) {
                message.error("Không thể thêm gói thầu mới.");
                console.error(error);
            }
        },
        async handleDeleteBid(id) {
            try {
                await deleteBid(id); // Gọi API xóa gói thầu
                this.bids = this.bids.filter((bid) => bid.id !== id);
                message.success("Gói thầu đã được xóa thành công.");
            } catch (error) {
                message.error("Không thể xóa gói thầu.");
                console.error(error);
            }
        },
        handleSearch(value) {
            this.searchKeyword = value;
        },
        editBid(id) {
            this.$router.push({name: "BidEdit", params: {id}});
        },
        viewBidDetails(id) {
            this.$router.push({name: "BidDetail", params: {id}});
        },

        handleTableChange() {
            console.log('123')
        }
    },
};
</script>

<style scoped>
.bids-list {
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

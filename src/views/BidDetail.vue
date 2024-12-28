<template>
    <div class="bid-details">
        <!-- Tiêu đề -->
        <div class="header">
            <h2>Chi Tiết Gói Thầu</h2>
            <a-button type="primary" @click="$router.push({ name: 'BidsList' })">
                Quay lại danh sách
            </a-button>
        </div>

        <!-- Thông tin gói thầu -->
        <a-card title="Thông Tin Gói Thầu" class="info-card" v-if="bid">
            <a-descriptions bordered :column="1">
                <a-descriptions-item label="Tên Dự Án">{{ bid.project_name }}</a-descriptions-item>
                <a-descriptions-item label="Tổ Chức Mời Thầu">{{ bid.organization }}</a-descriptions-item>
                <a-descriptions-item label="Giá Trị Dự Thầu">{{ formatCurrency(bid.bid_amount) }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Nộp Hồ Sơ">{{ bid.submission_date }}</a-descriptions-item>
                <a-descriptions-item label="Trạng Thái">{{ bid.status }}</a-descriptions-item>
                <a-descriptions-item label="Lý Do Không Trúng Thầu" v-if="bid.reason">{{ bid.reason }}</a-descriptions-item>
                <a-descriptions-item label="Tài Liệu Đính Kèm">
                    <ul>
                        <li v-for="(doc, index) in parsedDocuments" :key="index">
                            <a :href="doc.path" target="_blank">{{ doc.name }}</a>
                        </li>
                    </ul>
                </a-descriptions-item>
                <a-descriptions-item label="Ngày Tạo">{{ bid.created_at }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Cập Nhật">{{ bid.updated_at }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <!-- Hiển thị thông báo đang tải -->
        <a-spin v-else style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            Đang tải thông tin gói thầu...
        </a-spin>

        <!-- Nhận xét về gói thầu -->
        <a-card title="Nhận Xét Gói Thầu" class="comments-card">
            <a-form @submit.prevent="submitComment">
                <a-form-item>
                    <a-textarea
                        v-model="newComment"
                        placeholder="Nhập nhận xét về gói thầu"
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
import {message} from "ant-design-vue";
import { fetchBidDetail } from "@/apis/bids"; // Import hàm lấy dữ liệu gói thầu từ API

export default {
    name: "BidDetail",
    data() {
        return {
            bid: null, // Chi tiết gói thầu
            comments: [], // Danh sách nhận xét
            newComment: "", // Nhận xét mới
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    computed: {
        parsedDocuments() {
            try {
                return JSON.parse(this.bid.documents || "[]");
            } catch (e) {
                return [];
            }
        },
    },
    async mounted() {
        const bidId = this.$route.params.id; // Lấy ID gói thầu từ URL
        await this.loadBidDetails(bidId); // Tải chi tiết gói thầu
    },
    methods: {
        async loadBidDetails(id) {
            this.loading = true;
            try {
                const response = await fetchBidDetail(id); // Gọi API lấy dữ liệu gói thầu
                this.bid = response; // Lưu chi tiết gói thầu
                this.comments = [
                    // Dữ liệu mẫu nhận xét
                    {id: 1, content: "Nhận xét mẫu 1.", date: "2024-12-01"},
                    {id: 2, content: "Nhận xét mẫu 2.", date: "2024-12-05"},
                ];
            } catch (error) {
                message.error("Không thể tải thông tin gói thầu.");
                console.error("Error fetching bid details:", error);
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
        formatCurrency(value) {
            return new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(value);
        },
    },
};
</script>

<style scoped>
.bid-details {
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

<template>
    <div class="customer-details">
        <!-- Tiêu đề -->
        <div class="header">
            <h2>Chi Tiết Khách Hàng</h2>
            <a-button type="primary" @click="$router.push({ name: 'CustomersList' })">
                Quay lại danh sách
            </a-button>
        </div>

        <!-- Thông tin khách hàng -->
        <a-card title="Thông Tin Khách Hàng" class="info-card" v-if="customer">
            <a-descriptions bordered :column="1">
                <a-descriptions-item label="Họ và Tên">{{ customer.full_name }}</a-descriptions-item>
                <a-descriptions-item label="Email">{{ customer.email }}</a-descriptions-item>
                <a-descriptions-item label="Số Điện Thoại">{{ customer.phone_number }}</a-descriptions-item>
                <a-descriptions-item label="Địa Chỉ">{{ customer.address }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Sinh">{{ customer.date_of_birth }}</a-descriptions-item>
                <a-descriptions-item label="Giới Tính">{{ customer.gender }}</a-descriptions-item>
                <a-descriptions-item label="Tên Công Ty">{{ customer.company_name }}</a-descriptions-item>
                <a-descriptions-item label="Lĩnh Vực Kinh Doanh">{{ customer.business_field }}</a-descriptions-item>
                <a-descriptions-item label="Quốc gia">{{ customer.company_origin }}</a-descriptions-item>
                <a-descriptions-item label="Loại Hình Công Ty">{{ customer.company_type }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Tạo">{{ customer.created_at }}</a-descriptions-item>
                <a-descriptions-item label="Trạng Thái">{{ customer.status }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <!-- Hiển thị thông báo đang tải -->
        <a-spin v-else style="width: 100%; display: flex; justify-content: center; margin-top: 20px;">
            Đang tải thông tin khách hàng...
        </a-spin>

        <!-- Nhận xét khách hàng -->
        <a-card title="Nhận Xét Khách Hàng" class="comments-card">
            <a-form @submit.prevent="submitComment">
                <a-form-item>
                    <a-textarea
                        v-model="newComment"
                        placeholder="Nhập nhận xét về khách hàng"
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
import axios from "axios";
import { message } from "ant-design-vue";

export default {
    name: "CustomerDetails",
    data() {
        return {
            customer: null, // Chi tiết khách hàng
            comments: [], // Danh sách nhận xét
            newComment: "", // Nhận xét mới
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    async mounted() {
        const customerId = this.$route.params.id; // Lấy ID khách hàng từ URL
        await this.loadCustomerDetails(customerId); // Tải chi tiết khách hàng
    },
    methods: {
        async loadCustomerDetails(id) {
            this.loading = true;
            try {
                const response = await axios.get(`http://localhost/codeigniter-app/api/customers/${id}`);
                this.customer = response.data; // Lưu chi tiết khách hàng
                this.comments = [
                    // Dữ liệu mẫu nhận xét
                    { id: 1, content: "Nhận xét mẫu 1.", date: "2024-12-01" },
                    { id: 2, content: "Nhận xét mẫu 2.", date: "2024-12-05" },
                ];
            } catch (error) {
                message.error("Không thể tải thông tin khách hàng.");
                console.error("Error fetching customer details:", error);
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
.customer-details {
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

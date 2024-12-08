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
        <a-card title="Thông Tin Khách Hàng" class="info-card">
            <a-descriptions bordered :column="1">
                <a-descriptions-item label="Họ và Tên">{{ customer.name }}</a-descriptions-item>
                <a-descriptions-item label="Email">{{ customer.email }}</a-descriptions-item>
                <a-descriptions-item label="Số Điện Thoại">{{ customer.phone }}</a-descriptions-item>
                <a-descriptions-item label="Địa Chỉ">{{ customer.address }}</a-descriptions-item>
                <a-descriptions-item label="Ngày Thêm">{{ customer.createdAt }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <!-- Nhận xét khách hàng -->
        <a-card title="Đặc điểm khách Hàng" class="comments-card">
            <a-form @submit.prevent="submitComment">
                <a-form-item>
                    <a-textarea
                        v-model="newComment"
                        placeholder="Nhập nhận xét về khách hàng (Lý do không hợp tác...)"
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
                :dataSource="customer.comments"
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
export default {
    name: "CustomerDetails",
    data() {
        return {
            customer: {
                id: 1,
                name: "Nguyễn Văn A",
                email: "a@example.com",
                phone: "0901234567",
                address: "123 Đường ABC, Phường XYZ, Thành phố HCM",
                createdAt: "2024-01-01",
                comments: [
                    { id: 1, content: "Không đủ điều kiện thanh toán.", date: "2024-01-02" },
                    { id: 2, content: "Không có nhu cầu hợp tác trong thời điểm hiện tại.", date: "2024-01-10" },
                ],
            },
            newComment: "",
        };
    },
    methods: {
        submitComment() {
            if (this.newComment.trim() === "") {
                this.$message.warning("Nhận xét không được để trống.");
                return;
            }

            const newComment = {
                id: this.customer.comments.length + 1,
                content: this.newComment,
                date: new Date().toISOString().split("T")[0],
            };
            this.customer.comments.push(newComment);
            this.newComment = ""; // Reset form
            this.$message.success("Nhận xét đã được lưu.");
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

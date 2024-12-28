<template>
    <div class="edit-bid">
        <div class="header">
            <h2>Sửa Thông Tin Gói Thầu</h2>
            <a-button type="default" @click="$router.push({ name: 'BidsList' })">
                Quay lại danh sách
            </a-button>
        </div>

        <!-- Kiểm tra nếu bid đã tải -->
        <a-card title="Thông Tin Gói Thầu" v-if="bid">
            <a-form
                :model="bid"
                :layout="'vertical'"
                @submit.prevent="updateBid"
            >
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Dự Án" :rules="[{ required: true, message: 'Vui lòng nhập tên dự án!' }]">
                            <a-input v-model:value="bid.project_name" placeholder="Nhập tên dự án" />
                        </a-form-item>
                        <a-form-item label="Tổ Chức Mời Thầu" :rules="[{ required: true, message: 'Vui lòng nhập tổ chức mời thầu!' }]">
                            <a-input v-model:value="bid.organization" placeholder="Nhập tổ chức mời thầu" />
                        </a-form-item>
                        <a-form-item label="Giá Trị Dự Thầu" :rules="[{ required: true, message: 'Vui lòng nhập giá trị dự thầu!' }]">
                            <a-input-number
                                v-model:value="bid.bid_amount"
                                placeholder="Nhập giá trị dự thầu"
                                style="width: 100%;"
                            />
                        </a-form-item>
                        <a-form-item label="Ngày Nộp Hồ Sơ">
                            <a-date-picker
                                v-model:value="bid.submission_date"
                                format="YYYY-MM-DD"
                                placeholder="Chọn ngày nộp hồ sơ"
                            />
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Trạng Thái">
                            <a-select v-model:value="bid.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Đang xét duyệt">Đang xét duyệt</a-select-option>
                                <a-select-option value="Đã trúng thầu">Đã trúng thầu</a-select-option>
                                <a-select-option value="Không trúng thầu">Không trúng thầu</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item v-if="bid.status === 'Không trúng thầu'" label="Lý Do Không Trúng Thầu">
                            <a-input v-model:value="bid.reason" placeholder="Nhập lý do không trúng thầu" />
                        </a-form-item>
                        <a-form-item label="Tài Liệu Đính Kèm">
                            <ul>
                                <li v-for="(doc, index) in parsedDocuments" :key="index">
                                    <a :href="doc.path" target="_blank">{{ doc.name }}</a>
                                </li>
                            </ul>
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
            Đang tải thông tin gói thầu...
        </a-spin>
    </div>
</template>

<script>
import { fetchBidDetail, updateBid } from "@/apis/bids"; // Import API
import { message } from "ant-design-vue";
import dayjs from "dayjs";

export default {
    name: "BidEdit",
    data() {
        return {
            bid: null, // Dữ liệu gói thầu
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
        const bidId = this.$route.params.id; // Lấy ID từ route
        await this.loadBid(bidId); // Tải dữ liệu gói thầu
    },
    methods: {
        async loadBid(id) {
            this.loading = true;
            try {
                const response = await fetchBidDetail(id); // Lấy dữ liệu từ API
                if (response.submission_date) {
                    response.submission_date = dayjs(response.submission_date); // Chuyển đổi thành Day.js object
                }
                this.bid = response;
            } catch (error) {
                console.error("Error loading bid:", error);
                message.error("Không thể tải thông tin gói thầu.");
            } finally {
                this.loading = false;
            }
        },
        async updateBid() {
            try {
                const payload = { ...this.bid };
                if (payload.submission_date) {
                    payload.submission_date = dayjs(payload.submission_date).format("YYYY-MM-DD"); // Định dạng lại ngày
                }
                await updateBid(payload.id, payload); // Gửi dữ liệu tới API
                message.success("Thông tin gói thầu đã được cập nhật.");
                this.$router.push({ name: "BidsList" });
            } catch (error) {
                console.error("Error updating bid:", error);
                message.error("Không thể cập nhật thông tin gói thầu.");
            }
        },
    },
};
</script>

<style scoped>
.edit-bid {
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

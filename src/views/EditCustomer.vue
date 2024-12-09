<template>
    <div class="edit-customer">
        <div class="header">
            <h2>Sửa Thông Tin Khách Hàng</h2>
            <a-button type="default" @click="$router.push({ name: 'CustomersList' })">
                Quay lại danh sách
            </a-button>
        </div>

        <!-- Kiểm tra nếu customer đã tải -->
        <a-card title="Thông Tin Khách Hàng" v-if="customer">
            <a-form
                :model="customer"
                :layout="'vertical'"
                @submit.prevent="updateCustomer"
            >
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Họ và Tên" :rules="[{ required: true, message: 'Vui lòng nhập họ và tên!' }]">
                            <a-input v-model:value="customer.full_name" placeholder="Nhập họ và tên" />
                        </a-form-item>
                        <a-form-item label="Email" :rules="[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]">
                            <a-input v-model:value="customer.email" placeholder="Nhập email" />
                        </a-form-item>
                        <a-form-item label="Số Điện Thoại" :rules="[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]">
                            <a-input v-model:value="customer.phone_number" placeholder="Nhập số điện thoại" />
                        </a-form-item>
                        <a-form-item label="Ngày Sinh">
                            <a-date-picker
                                v-model:value="customer.date_of_birth"
                                format="YYYY-MM-DD"
                                placeholder="Chọn ngày sinh"
                            />
                        </a-form-item>
                        <a-form-item label="Giới Tính">
                            <a-select v-model:value="customer.gender" placeholder="Chọn giới tính">
                                <a-select-option value="Male">Nam</a-select-option>
                                <a-select-option value="Female">Nữ</a-select-option>
                                <a-select-option value="Other">Khác</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Công Ty">
                            <a-input v-model:value="customer.company_name" placeholder="Nhập tên công ty" />
                        </a-form-item>
                        <a-form-item label="Lĩnh Vực Kinh Doanh">
                            <a-input v-model:value="customer.business_field" placeholder="Nhập lĩnh vực kinh doanh" />
                        </a-form-item>
                        <a-form-item label="Quốc gia">
                            <a-select v-model:value="customer.company_origin" placeholder="Chọn quốc gia">
                                <a-select-option value="Vietnam">Việt Nam</a-select-option>
                                <a-select-option value="International">Quốc Tế</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="Loại Hình Công Ty">
                            <a-select v-model:value="customer.company_type" placeholder="Chọn loại hình công ty">
                                <a-select-option value="Private">Tư Nhân</a-select-option>
                                <a-select-option value="State-Owned">Nhà Nước</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="Trạng Thái">
                            <a-select v-model:value="customer.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Active">Hoạt Động</a-select-option>
                                <a-select-option value="Inactive">Không Hoạt Động</a-select-option>
                            </a-select>
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
            Đang tải thông tin khách hàng...
        </a-spin>
    </div>
</template>



<script>
import { fetchCustomerById, updateCustomer as updateCustomerApi } from "@/apis/customers"; // Import API
import { message } from "ant-design-vue";
import dayjs from "dayjs";

export default {
    name: "EditCustomer",
    data() {
        return {
            customer: null, // Dữ liệu khách hàng
            loading: false, // Trạng thái tải dữ liệu
        };
    },
    async mounted() {
        const customerId = this.$route.params.id; // Lấy ID từ route
        await this.loadCustomer(customerId); // Tải dữ liệu khách hàng
    },
    methods: {
        async loadCustomer(id) {
            this.loading = true;
            try {
                const response = await fetchCustomerById(id); // Lấy dữ liệu từ API
                if (response.date_of_birth) {
                    response.date_of_birth = dayjs(response.date_of_birth); // Chuyển đổi thành Day.js object
                }
                this.customer = response;
            } catch (error) {
                console.error("Error loading customer:", error);
            } finally {
                this.loading = false;
            }
        },
        async updateCustomer() {
            try {
                const payload = { ...this.customer };
                if (payload.date_of_birth) {
                    payload.date_of_birth = dayjs(payload.date_of_birth).format("YYYY-MM-DD"); // Định dạng lại ngày
                }
                await updateCustomerApi(payload.customer_id, payload); // Gửi dữ liệu tới API
                message.success("Thông tin khách hàng đã được cập nhật.");
                this.$router.push({ name: "CustomersList" });
            } catch (error) {
                console.error("Error updating customer:", error);
                message.error("Không thể cập nhật thông tin khách hàng.");
            }
        },
    },
};
</script>

<style scoped>
.edit-customer {
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

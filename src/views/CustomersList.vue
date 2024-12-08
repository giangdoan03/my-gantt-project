<template>
    <div class="customers-list">
        <!-- Tiêu đề và thanh công cụ -->
        <div class="header">
            <h2>Danh Sách Khách Hàng</h2>
            <a-input-search
                v-model:value="searchKeyword"
                placeholder="Tìm kiếm khách hàng..."
                @search="handleSearch"
                style="width: 300px"
            />
            <a-button type="primary" @click="showAddCustomerModal">
                <plus-outlined/>
                Thêm Khách Hàng
            </a-button>
        </div>

        <!-- Modal Thêm Khách Hàng -->
        <a-modal
            v-model:open="addCustomerModalVisible"
            title="Thêm Khách Hàng"
            ok-text="Lưu"
            cancel-text="Hủy"
            width="1000px"
            centered
            @ok="handleAddCustomer"
        >
            <a-form :model="newCustomer" :layout="'vertical'" ref="addCustomerForm">
                <a-row gutter="16">
                    <!-- Cột 1 -->
                    <a-col :span="12">
                        <a-form-item label="Họ và Tên"
                                     :rules="[{ required: true, message: 'Vui lòng nhập họ và tên!' }]">
                            <a-input v-model:value="newCustomer.full_name" placeholder="Nhập họ và tên"/>
                        </a-form-item>
                        <a-form-item label="Email"
                                     :rules="[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]">
                            <a-input v-model:value="newCustomer.email" placeholder="Nhập email"/>
                        </a-form-item>
                        <a-form-item label="Số Điện Thoại"
                                     :rules="[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]">
                            <a-input v-model:value="newCustomer.phone_number" placeholder="Nhập số điện thoại"/>
                        </a-form-item>
                        <a-form-item label="Ngày Sinh">
                            <a-date-picker v-model:value="newCustomer.date_of_birth" placeholder="Chọn ngày sinh"
                                           format="YYYY-MM-DD"/>
                        </a-form-item>
                        <a-form-item label="Giới Tính">
                            <a-select v-model:value="newCustomer.gender" placeholder="Chọn giới tính">
                                <a-select-option value="Male">Nam</a-select-option>
                                <a-select-option value="Female">Nữ</a-select-option>
                                <a-select-option value="Other">Khác</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <!-- Cột 2 -->
                    <a-col :span="12">
                        <a-form-item label="Tên Công Ty">
                            <a-input v-model:value="newCustomer.company_name" placeholder="Nhập tên công ty"/>
                        </a-form-item>
                        <a-form-item label="Lĩnh Vực Kinh Doanh">
                            <a-input v-model:value="newCustomer.business_field" placeholder="Nhập lĩnh vực kinh doanh"/>
                        </a-form-item>
                        <a-form-item label="Nguồn Gốc Công Ty">
                            <a-select v-model:value="newCustomer.company_origin" placeholder="Chọn nguồn gốc công ty">
                                <a-select-option value="Vietnam">Việt Nam</a-select-option>
                                <a-select-option value="International">Quốc Tế</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="Loại Hình Công Ty">
                            <a-select v-model:value="newCustomer.company_type" placeholder="Chọn loại hình công ty">
                                <a-select-option value="Private">Tư Nhân</a-select-option>
                                <a-select-option value="State-Owned">Nhà Nước</a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="Trạng Thái">
                            <a-select v-model:value="newCustomer.status" placeholder="Chọn trạng thái">
                                <a-select-option value="Active">Hoạt Động</a-select-option>
                                <a-select-option value="Inactive">Không Hoạt Động</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </a-modal>


        <!-- Bảng khách hàng -->
        <a-table
            :columns="columns"
            :data-source="filteredCustomers"
            :row-key="record => record.id"
            :loading="loading"
            @change="handleTableChange"
            bordered
        >
            <template v-slot:bodyCell="{ column, record }">
                <template v-if="column && column.key === 'actions'">
                    <a-space>
                        <!-- Nút Sửa -->
                        <a-tooltip title="Sửa">
                            <a-button type="link" @click="editCustomer(record.customer_id)">
                                <edit-outlined/>
                            </a-button>
                        </a-tooltip>
                        <!-- Nút Xóa -->
                        <a-tooltip title="Xóa">
                            <a-popconfirm
                                title="Bạn có chắc muốn xóa người dùng này không?"
                                ok-text="Xóa"
                                cancel-text="Hủy"
                                @confirm="deleteCustomer(record.customer_id)"
                            >
                                <a-button type="link" danger>
                                    <delete-outlined/>
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
import {
    fetchCustomers,
    deleteCustomer as deleteCustomerApi,
    createCustomer as createCustomerApi
} from "@/apis/customers";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {h} from "vue";
import {message} from "ant-design-vue";

export default {
    name: "CustomersList",
    components: {
        EditOutlined, DeleteOutlined, PlusOutlined,
    },
    mounted() {
        this.$message = message;
        this.loadCustomers(); // Tải dữ liệu khách hàng khi component được mount
    },
    data() {
        return {
            loading: false,
            addCustomerModalVisible: false, // Trạng thái hiển thị Modal
            searchKeyword: "",
            customers: [], // Dữ liệu khách hàng từ API
            newCustomer: {
                full_name: "",
                email: "",
                phone_number: "",
                address: "",
                date_of_birth: null,
                gender: null,
                company_name: "",
                business_field: "",
                company_origin: null,
                company_type: null,
                status: "Active",
            }, // Dữ liệu khách hàng mới
            columns: [
                {
                    title: "Họ Tên",
                    dataIndex: "full_name",
                    key: "full_name",
                    customRender: ({text, record}) => {
                        return h(
                            "a",
                            {
                                class: "clickable-cell",
                                onClick: () => this.viewCustomerDetails(record.customer_id),
                            },
                            text
                        );
                    },
                },
                {
                    title: "Email",
                    dataIndex: "email",
                    key: "email",
                },
                {
                    title: "Số Điện Thoại",
                    dataIndex: "phone_number",
                    key: "phone_number",
                },
                {
                    title: "Hành Động",
                    key: "actions",
                },
            ],
            pagination: {
                current: 1,
                pageSize: 5,
                total: 0, // Tổng số khách hàng (API sẽ cung cấp)
            },
        };
    },
    computed: {
        filteredCustomers() {
            if (!this.searchKeyword) return this.customers;
            return this.customers.filter(
                (customer) =>
                    customer.full_name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    customer.email.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    customer.phone_number.includes(this.searchKeyword)
            );
        },
    },
    methods: {
        async loadCustomers() {
            try {
                this.loading = true;
                const customers = await fetchCustomers(); // Gọi API lấy danh sách khách hàng
                this.customers = customers;
                this.pagination.total = customers.length; // Cập nhật tổng số khách hàng
            } catch (error) {
                this.$message.error("Không thể tải danh sách khách hàng.");
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        showAddCustomerModal() {
            this.addCustomerModalVisible = true;
        },
        async handleAddCustomer() {
            try {
                // Gọi API thêm khách hàng
                await createCustomerApi(this.newCustomer);
                message.success("Khách hàng mới đã được thêm thành công.");
                this.addCustomerModalVisible = false; // Đóng Modal
                this.loadCustomers(); // Tải lại danh sách khách hàng
                // Reset dữ liệu form
                this.newCustomer = {
                    full_name: "",
                    email: "",
                    phone_number: "",
                    address: "",
                    date_of_birth: null,
                    gender: null,
                    company_name: "",
                    business_field: "",
                    company_origin: null,
                    company_type: null,
                    status: "Active",
                };
            } catch (error) {
                message.error("Không thể thêm khách hàng mới.");
                console.error(error);
            }
        },
        handleSearch(value) {
            this.searchKeyword = value;
        },
        handleTableChange(pagination) {
            this.pagination = pagination;
        },
        navigateToAddCustomer() {
            this.showAddCustomerModal(); // Hiển thị Modal
        },
        editCustomer(id) {
            this.$router.push({name: "EditCustomer", params: {id}});
        },
        async deleteCustomer(id) {
            try {
                await deleteCustomerApi(id); // Gọi API xóa khách hàng
                this.customers = this.customers.filter((customer) => customer.customer_id !== id);
                this.$message.success("Đã xóa khách hàng thành công.");
            } catch (error) {
                this.$message.error("Không thể xóa khách hàng.");
                console.error(error);
            }
        },
        viewCustomerDetails(id) {
            this.$router.push({name: "CustomerDetails", params: {id}});
        },
    },
};
</script>


<style scoped>
.customers-list {
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

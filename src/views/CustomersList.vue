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
            <a-button type="primary" @click="navigateToAddCustomer">
                <plus-outlined/>
                Thêm Khách Hàng
            </a-button>
        </div>

        <!-- Bảng khách hàng -->
        <a-table
            :data-source="filteredCustomers"
            :pagination="false"
            row-key="id"
        >
            <!-- Cột Tên Khách Hàng -->
            <a-table-column title="Họ và Tên" dataIndex="name" key="name">
                <template v-slot:bodyCell="{ record }">
                    <div @click="viewCustomerDetails(record.id)" class="clickable-cell">
                        {{ record.name }}
                    </div>
                </template>
            </a-table-column>

            <!-- Cột Email -->
            <a-table-column title="Email" dataIndex="email" key="email"/>

            <!-- Cột Số Điện Thoại -->
            <a-table-column title="Số Điện Thoại" dataIndex="phone" key="phone"/>

            <!-- Cột Hành Động -->
            <a-table-column title="Hành Động" key="actions" :width="150">
                <template v-slot:bodyCell="{ record }">
                    <a-space>
                        <a-button type="link" @click.stop="editCustomer(record.id)">Chỉnh sửa</a-button>
                        <a-popconfirm
                            title="Bạn có chắc chắn muốn xóa khách hàng này?"
                            @confirm="deleteCustomer(record.id)"
                        >
                            <a-button type="link" danger>Xóa</a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </a-table-column>
        </a-table>
    </div>
</template>

<script>
import {PlusOutlined} from "@ant-design/icons-vue";

export default {
    name: "CustomersList",
    components: {
        PlusOutlined,
    },
    data() {
        return {
            searchKeyword: "",
            customers: [
                {id: 1, name: "Nguyễn Văn A", email: "a@example.com", phone: "0901234567"},
                {id: 2, name: "Trần Thị B", email: "b@example.com", phone: "0912345678"},
                {id: 3, name: "Lê Văn C", email: "c@example.com", phone: "0923456789"},
            ],
            pagination: {
                current: 1,
                pageSize: 5,
                total: 0,
            },
        };
    },
    computed: {
        filteredCustomers() {
            if (!this.searchKeyword) return this.customers;
            return this.customers.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    customer.email.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    customer.phone.includes(this.searchKeyword)
            );
        },
    },
    methods: {
        handleSearch(value) {
            this.searchKeyword = value;
        },
        navigateToAddCustomer() {
            this.$router.push({name: "AddCustomer"});
        },
        editCustomer(id) {
            this.$router.push({name: "EditCustomer", params: {id}});
        },
        viewCustomerDetails(id) {
            console.log('xxxx')
            this.$router.push({name: "CustomerDetails", params: {id}});
        },
        deleteCustomer(id) {
            this.customers = this.customers.filter((customer) => customer.id !== id);
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

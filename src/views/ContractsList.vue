<template>
    <div>
        <a-table
            :columns="columns"
            :data-source="contracts"
            row-key="id"
            :loading="loading"
            bordered
            :customRow="customRowHandler"
        />
    </div>
</template>

<script>
import { fetchContracts } from "@/apis/contracts";


export default {
    name: "ContractsList",
    data() {
        return {
            contracts: [], // Dữ liệu hợp đồng
            loading: false, // Trạng thái loading
            columns: [
                {
                    title: "Mã hợp đồng",
                    dataIndex: "contract_code",
                    key: "contract_code",
                },
                {
                    title: "Tên hợp đồng",
                    dataIndex: "contract_name",
                    key: "contract_name",
                },
                {
                    title: "Ngày bắt đầu",
                    dataIndex: "start_date",
                    key: "start_date",
                },
                {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                },
            ],
        };
    },
    computed: {

    },
    async created() {
        this.loading = true;
        try {
            const data = await fetchContracts();
            this.contracts = data;
        } catch (error) {
            this.$message.error("Lỗi khi tải danh sách hợp đồng!");
        } finally {
            this.$nextTick(() => {
                this.loading = false; // Tắt loading sau khi Vue cập nhật trạng thái
            });
        }
    },
    methods: {
        // Hàm xử lý khi click vào hàng
        customRowHandler(record) {
            return {
                onClick: () => this.handleRowClick(record), // Gắn sự kiện click
            };
        },
        handleRowClick(record) {
            if (record && record.id) {
                this.$router.push({
                    name: "ContractDetails", // Tên route được định nghĩa trong router
                    params: { id: record.id }, // Truyền tham số id
                });
            } else {
                this.$message.error("Không thể chuyển trang do thiếu ID hợp đồng!");
            }
        },
    },
};
</script>
